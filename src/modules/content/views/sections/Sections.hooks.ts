import { useContentRepository } from '~/modules/content/repositories'
import { usePostsRepository } from '~/modules/posts/repositories'
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES, preferredTranslation } from '~/modules/content/contracts/content'
import { parseGrid } from '~/shared/helpers/grid'
import { BLOCKS, SINGLE_KINDS, defaultSettings, kindsFor } from '~/modules/content/contracts/blocks'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { ContentPage, IContentListRaw, IPageMetaDraft, ISectionDraft, SectionKind } from '~/modules/content/contracts/blocks'
import type { IBuilderContext } from '~/modules/content/contracts/builder'
import type { EditableSection } from '~/modules/content/models/EditableSection'
import type { IGrid } from '~/shared/helpers/grid'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDraftSection extends ISectionDraft {
  key: string
}

export interface ILayoutChoice {
  uuid: string
  name: string
  grid: IGrid
}

const blankTitles = () => Object.fromEntries(
  CONTENT_LOCALES.map(locale => [locale, '']),
) as Record<ContentLocale, string>

let counter = 0
const nextKey = () => `section-${++counter}`

const blankMeta = (): IPageMetaDraft => ({
  seo: Object.fromEntries(CONTENT_LOCALES.map(locale => [locale, { title: '', description: '' }])) as IPageMetaDraft['seo'],
})

const toDraft = (section: EditableSection): IDraftSection => {
  const { uuid, ...draft } = section.toObject()

  return {
    ...draft,
    titles: { ...draft.titles },
    subtitles: { ...draft.subtitles },
    eyebrows: { ...draft.eyebrows },
    bodies: { ...draft.bodies },
    ctaLabels: { ...draft.ctaLabels },
    settings: { ...draft.settings },
    postIds: [...draft.postIds],
    key: uuid,
  }
}

const snapshot = (sections: IDraftSection[], meta: IPageMetaDraft | null) =>
  JSON.stringify({ sections: sections.map(({ key: _key, ...rest }) => rest), meta })

export const PAGES_WITH_SEO: ContentPage[] = ['blog']

export const useSections = (page: ContentPage) => {
  const { t } = useI18n()
  const { saved: cheer, fail, failed } = useToast()
  const {
    sections, lists, list, layouts, createLayout, saveSections,
    pageMeta, savePageMeta, upload, removeUpload,
  } = useContentRepository()
  const { all: allPosts } = usePostsRepository()
  const { mediaLibrary } = useMediaLibrary()

  const hasSeo = PAGES_WITH_SEO.includes(page)
  const kinds = kindsFor(page)
  const meta = ref<IPageMetaDraft | null>(hasSeo ? blankMeta() : null)
  const uploading = ref<string | null>(null)

  const locale = ref<ContentLocale>(CMS_DEFAULT_LOCALE)
  const draft = ref<IDraftSection[]>([])
  const pristine = ref('[]')
  const selected = ref<string | null>(null)
  const removed = ref<{ section: IDraftSection, index: number } | null>(null)
  const fullLists = ref<IContentListRaw[]>([])

  const saving = ref(false)
  const error = ref('')

  const loaded = ref(false)

  const { data, status, refresh } = useAsyncData(`cms:sections:${page}`, async () => {
    const [current, allLists, allLayouts, posts, seo] = await Promise.all([
      sections(page), lists(), layouts(), allPosts(), hasSeo ? pageMeta(page) : Promise.resolve(null),
    ])

    if (!loaded.value) {
      loaded.value = true
      draft.value = current.map(toDraft)
      meta.value = seo ? structuredClone(seo.toObject()) : meta.value
      pristine.value = snapshot(draft.value, meta.value)
    }

    return { lists: allLists, layouts: allLayouts, posts }
  }, { default: () => ({ lists: [], layouts: [], posts: [] }) })

  const dirty = computed(() => snapshot(draft.value, meta.value) !== pristine.value)

  const postOptions = computed(() => (data.value?.posts ?? []).map(post => ({
    value: post.uuid,
    label: preferredTranslation(post.translations, item => Boolean(item.title))?.title ?? post.slug,
    hint: post.is_published ? undefined : t('cms.posts.draft'),
  })))

  const listOptions = (kind: SectionKind) => (data.value?.lists ?? [])
    .filter(list => (list.kind ?? 'cards') === kind)
    .map(list => ({
      value: list.uuid,
      label: list.name,
      hint: t('cms.lists.items', { count: list.items_count }),
    }))

  const layoutChoices = computed<ILayoutChoice[]>(() => (data.value?.layouts ?? [])
    .map(layout => ({ uuid: layout.uuid, name: layout.name || layout.grid, grid: parseGrid(layout.grid) }))
    .filter((layout): layout is ILayoutChoice => layout.grid !== null)
    .sort((a, b) => a.grid.capacity - b.grid.capacity))

  const listName = (listId: string) => (data.value?.lists ?? []).find(list => list.uuid === listId)?.name ?? null

  const layoutName = (layoutId: string) => layoutChoices.value.find(layout => layout.uuid === layoutId)?.name ?? null

  const capacityOf = (layoutId: string): number | null =>
    layoutChoices.value.find(layout => layout.uuid === layoutId)?.grid.capacity ?? null

  const itemsIn = (listId: string): number | null =>
    (data.value?.lists ?? []).find(list => list.uuid === listId)?.items_count ?? null

  const overflow = (section: IDraftSection): { items: number, capacity: number } | null => {
    if (!BLOCKS[section.kind].layout || section.source !== 'list') return null

    const capacity = capacityOf(section.layoutId)
    const items = itemsIn(section.listId)

    if (capacity === null || items === null || items <= capacity) return null

    return { items, capacity }
  }

  const missingLocales = (section: IDraftSection): ContentLocale[] => {
    const texts = BLOCKS[section.kind].bodyRequired ? section.bodies : section.titles

    return CONTENT_LOCALES.filter(code => !texts[code].trim())
  }

  const problemOf = (section: IDraftSection): string | null => {
    const block = BLOCKS[section.kind]

    if (block.titleRequired && CONTENT_LOCALES.every(code => !section.titles[code].trim())) {
      return t('cms.sections.problems.title')
    }

    if (block.bodyRequired && missingLocales(section).length === CONTENT_LOCALES.length) {
      return t('cms.sections.problems.body')
    }

    if (section.source === 'list' && !section.listId) return t('cms.sections.problems.list')

    if (block.layout && !section.layoutId) return t('cms.sections.problems.layout')

    if (SINGLE_KINDS.includes(section.kind) && draft.value.find(other => other.kind === section.kind) !== section) {
      return t('cms.sections.problems.single')
    }

    const anchor = section.anchor.trim().toLowerCase()

    if (anchor && draft.value.some(other => other !== section && other.anchor.trim().toLowerCase() === anchor)) {
      return t('cms.sections.problems.anchor', { anchor })
    }

    return null
  }

  const problems = computed<Record<string, string>>(() => Object.fromEntries(
    draft.value
      .map(section => [section.key, problemOf(section)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== null),
  ))

  const selectedSection = computed(() => draft.value.find(section => section.key === selected.value) ?? null)

  const add = (kind: SectionKind, index = draft.value.length): string => {
    const section: IDraftSection = {
      key: nextKey(),
      kind,
      source: BLOCKS[kind].sources[0]!,
      link: '',
      anchor: '',
      postIds: [],
      listId: listOptions(kind)[0]?.value ?? '',
      layoutId: BLOCKS[kind].layout ? (layoutChoices.value[0]?.uuid ?? '') : '',
      isPublished: true,
      titles: blankTitles(),
      subtitles: blankTitles(),
      eyebrows: blankTitles(),
      bodies: blankTitles(),
      ctaLabels: blankTitles(),
      settings: defaultSettings(kind),
    }

    const next = [...draft.value]
    next.splice(Math.max(0, Math.min(index, next.length)), 0, section)
    draft.value = next
    selected.value = section.key

    return section.key
  }

  const duplicate = (key: string): string | null => {
    const index = draft.value.findIndex(section => section.key === key)
    const source = draft.value[index]

    if (!source) return null

    const { key: _key, ...rest } = source
    const copy: IDraftSection = { ...structuredClone(toRaw(rest)), anchor: '', key: nextKey() }
    const next = [...draft.value]

    next.splice(index + 1, 0, copy)
    draft.value = next
    selected.value = copy.key

    return copy.key
  }

  const toggleHidden = (key: string) => {
    const section = draft.value.find(item => item.key === key)

    if (section) section.isPublished = !section.isPublished
  }

  const remove = (key: string) => {
    const index = draft.value.findIndex(section => section.key === key)

    if (index < 0) return

    removed.value = { section: draft.value[index]!, index }
    draft.value = draft.value.filter(section => section.key !== key)

    if (selected.value === key) selected.value = null
  }

  const undoRemove = () => {
    if (!removed.value) return

    const next = [...draft.value]
    next.splice(removed.value.index, 0, removed.value.section)
    draft.value = next
    removed.value = null
  }

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= draft.value.length) return

    const next = [...draft.value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    draft.value = next
  }

  const moveTo = (key: string, to: number) => {
    move(draft.value.findIndex(section => section.key === key), to)
  }

  const select = (key: string | null) => {
    selected.value = key
  }

  const newLayout = reactive({ open: false, grid: '', name: '', saving: false, error: '', for: '' })

  function openLayout(sectionKey: string) {
    Object.assign(newLayout, { open: true, grid: '', name: '', error: '', for: sectionKey })
  }

  async function submitLayout() {
    newLayout.saving = true
    newLayout.error = ''

    try {
      const created = await createLayout(newLayout.grid.trim(), newLayout.name.trim())

      await refresh()

      const target = draft.value.find(section => section.key === newLayout.for)

      if (target) target.layoutId = created.uuid

      newLayout.open = false
      cheer(t('cms.sections.layouts.created'))
    }
    catch (e) {
      newLayout.error = failed(e, t('cms.sections.layouts.failed'))
    }
    finally {
      newLayout.saving = false
    }
  }

  const loadingLists = new Set<string>()

  async function loadLists() {
    const wanted = [...new Set(draft.value.filter(section => section.source === 'list' && section.listId).map(section => section.listId))]
    const missing = wanted.filter(id => !loadingLists.has(id) && !fullLists.value.some(item => item.uuid === id))

    if (!missing.length) return

    missing.forEach(id => loadingLists.add(id))

    try {
      fullLists.value = [...fullLists.value, ...await Promise.all(missing.map(id => list(id)))]
    }
    catch (e) {
      failed(e)
    }
    finally {
      missing.forEach(id => loadingLists.delete(id))
    }
  }

  watch(() => draft.value.map(section => section.listId).join(), () => void loadLists(), { immediate: true })

  const context = computed<IBuilderContext>(() => ({
    layouts: data.value?.layouts ?? [],
    lists: fullLists.value,
    posts: (data.value?.posts ?? []).filter(post => post.is_published),
  }))

  const dragging = ref<string | null>(null)
  const grabbed = ref<string | null>(null)

  const startDrag = (key: string, event: DragEvent) => {
    if (grabbed.value !== key) {
      event.preventDefault()
      return
    }

    dragging.value = key
    event.dataTransfer?.setData('text/plain', key)
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  }

  const dragOver = (key: string) => {
    if (!dragging.value || dragging.value === key) return

    const from = draft.value.findIndex(section => section.key === dragging.value)
    const to = draft.value.findIndex(section => section.key === key)

    move(from, to)
  }

  const endDrag = () => {
    dragging.value = null
    grabbed.value = null
  }

  let pendingUpload: Promise<unknown> = Promise.resolve()

  async function pickImage(section: IDraftSection, file: File | null) {
    if (!file) return

    uploading.value = section.key

    let settle = () => {}
    pendingUpload = new Promise((resolve) => { settle = () => resolve(undefined) })

    try {
      section.settings.imageUrl = await upload(file)
    }
    catch {
      fail(t('cms.lists.uploadFailed'))
    }
    finally {
      uploading.value = null
      settle()
    }
  }

  const discardImage = (url: string) => {
    void pendingUpload.then(() => removeUpload(url))
  }

  const reset = () => {
    const saved = JSON.parse(pristine.value) as { sections: Array<Omit<IDraftSection, 'key'>>, meta: IPageMetaDraft | null }

    draft.value = saved.sections.map(section => ({ ...section, key: nextKey() }))
    meta.value = saved.meta
    removed.value = null
    selected.value = null
    error.value = ''
  }

  async function submit() {
    error.value = ''

    const broken = draft.value.find(section => problemOf(section))

    if (broken) {
      selected.value = broken.key
      error.value = fail(problemOf(broken)!)
      return
    }

    saving.value = true

    try {
      await saveSections(page, draft.value)

      if (meta.value) await savePageMeta(page, meta.value)

      pristine.value = snapshot(draft.value, meta.value)
      removed.value = null
      cheer()
    }
    catch (e) {
      error.value = failed(e, t('cms.errors.save'))
    }
    finally {
      saving.value = false
    }
  }

  return {
    page, kinds, meta, uploading, mediaLibrary, pickImage, discardImage,
    locale, draft, status, saving, error, dirty, selected, selectedSection, removed, context, problems,
    dragging, grabbed, startDrag, dragOver, endDrag,
    postOptions, listOptions, layoutChoices, listName, layoutName,
    overflow, missingLocales, problemOf,
    newLayout, openLayout, submitLayout,
    add, duplicate, toggleHidden, remove, undoRemove, move, moveTo, select, reset, submit,
  }
}
