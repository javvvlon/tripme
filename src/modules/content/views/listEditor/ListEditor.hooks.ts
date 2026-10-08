import { useContentRepository } from '~/modules/content/repositories'
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { BLOCKS } from '~/modules/content/contracts/blocks'
import type { BadgeType, ListKind } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDraftItem {
  key: string
  imageUrl: string
  link: string
  badgeType: BadgeType | ''
  translations: Record<ContentLocale, { title: string, description: string, badgeLabel: string }>
}

const blankTranslations = () => Object.fromEntries(
  CONTENT_LOCALES.map(locale => [locale, { title: '', description: '', badgeLabel: '' }]),
) as IDraftItem['translations']

let counter = 0
const nextKey = () => `draft-${++counter}`

const snapshot = (name: string, kind: ListKind, items: IDraftItem[]) =>
  JSON.stringify({ name, kind, items: items.map(({ key: _key, ...rest }) => rest) })

export const useListEditor = (id: string) => {
  const { t } = useI18n()
  const { saved: cheer, fail, loadFailed } = useToast()
  const localePath = useLocalePath()
  const { list, updateList, upload, removeUpload } = useContentRepository()
  const { mediaLibrary } = useMediaLibrary()

  const locale = ref<ContentLocale>(CMS_DEFAULT_LOCALE)
  const name = ref('')
  const kind = ref<ListKind>('cards')
  const savedKind = ref<ListKind>('cards')
  const items = ref<IDraftItem[]>([])

  const uploading = ref<string | null>(null)
  const selected = ref<string | null>(null)
  const pristine = ref('')

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const loaded = ref(false)

  const { status } = useAsyncData(`cms:list:${id}`, async () => {
    const raw = await list(id)

    if (loaded.value) return true

    loaded.value = true

    name.value = raw.name
    kind.value = raw.kind ?? 'cards'
    savedKind.value = kind.value
    items.value = raw.items.map(item => ({
      key: item.uuid,
      imageUrl: item.image_url ?? '',
      link: item.link ?? '',
      badgeType: item.badge_type ?? '',
      translations: {
        ...blankTranslations(),
        ...Object.fromEntries(item.translations.map(translation => [
          translation.locale,
          {
            title: translation.title,
            description: translation.description ?? '',
            badgeLabel: translation.badge_label ?? '',
          },
        ])),
      },
    }))

    pristine.value = snapshot(name.value, kind.value, items.value)

    return true
  })

  const dirty = computed(() => loaded.value && snapshot(name.value, kind.value, items.value) !== pristine.value)

  const current = computed(() => items.value.find(item => item.key === selected.value) ?? null)

  const select = (key: string | null) => {
    selected.value = key
  }

  const add = () => {
    const item: IDraftItem = {
      key: nextKey(),
      imageUrl: '',
      link: '',
      badgeType: '',
      translations: blankTranslations(),
    }

    items.value = [...items.value, item]
    selected.value = item.key
  }

  const duplicate = (key: string) => {
    const index = items.value.findIndex(item => item.key === key)
    const source = items.value[index]

    if (!source) return

    const copy: IDraftItem = { ...structuredClone(toRaw(source)), key: nextKey() }
    const next = [...items.value]

    next.splice(index + 1, 0, copy)
    items.value = next
    selected.value = copy.key
  }

  const remove = (key: string) => {
    items.value = items.value.filter(item => item.key !== key)

    if (selected.value === key) selected.value = null
  }

  const moveTo = (key: string, to: number) => {
    const from = items.value.findIndex(item => item.key === key)

    if (from < 0 || from === to || to < 0 || to >= items.value.length) return

    const next = [...items.value]
    const [moved] = next.splice(from, 1)

    next.splice(to, 0, moved!)
    items.value = next
  }

  const missingIn = (code: ContentLocale) => items.value.some(item => !item.translations[code].title.trim())

  async function pickImage(key: string, file: File | null) {
    if (!file) return

    uploading.value = key
    error.value = ''

    let settle = () => {}
    uploads = new Promise((resolve) => { settle = () => resolve(undefined) })

    try {
      const url = await upload(file)
      const item = items.value.find(candidate => candidate.key === key)

      if (item) {
        item.imageUrl = url
        items.value = [...items.value]
      }
    }
    catch {
      error.value = fail(t('cms.lists.uploadFailed'))
    }
    finally {
      uploading.value = null
      settle()
    }
  }

  const useStored = (key: string, url: string) => {
    const item = items.value.find(candidate => candidate.key === key)

    if (item) {
      item.imageUrl = url
      items.value = [...items.value]
    }
  }

  const clearImage = (key: string) => {
    const item = items.value.find(candidate => candidate.key === key)

    if (item) {
      item.imageUrl = ''
      items.value = [...items.value]
    }
  }

  const discardImage = (url: string) => {
    void uploads.then(() => removeUpload(url))
  }

  let uploads: Promise<unknown> = Promise.resolve()

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.value.length) return

    const next = [...items.value]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    items.value = next
  }

  const fields = computed(() => BLOCKS[kind.value].item)

  const missingTitles = computed(() =>
    items.value.filter(item => !CONTENT_LOCALES.some(code => item.translations[code].title.trim())))

  async function submit() {
    error.value = ''
    saved.value = false

    if (!name.value.trim()) {
      error.value = fail(t('cms.lists.nameRequired'))
      return
    }

    if (missingTitles.value.length) {
      selected.value = missingTitles.value[0]!.key
      error.value = fail(t('cms.lists.titleRequired'))
      return
    }

    saving.value = true

    try {
      await updateList(id, {
        name: name.value.trim(),
        kind: kind.value,
        items: items.value.map(item => ({
          image_url: fields.value.image ? item.imageUrl.trim() || null : null,
          link: fields.value.link ? item.link.trim() || null : null,
          badge_type: fields.value.badge ? item.badgeType || null : null,
          translations: CONTENT_LOCALES.map(code => ({
            locale: code,
            title: item.translations[code].title,
            description: item.translations[code].description,
            badge_label: item.translations[code].badgeLabel,
          })),
        })),
      })

      savedKind.value = kind.value
      pristine.value = snapshot(name.value, kind.value, items.value)
      saved.value = true
      cheer()
    }
    catch {
      error.value = fail(t(kind.value === savedKind.value ? 'cms.errors.save' : 'cms.lists.kindLocked'))
    }
    finally {
      saving.value = false
    }
  }

  const back = () => navigateTo(localePath('/app/content/lists'))

  const reset = () => {
    const saved = JSON.parse(pristine.value) as { name: string, kind: ListKind, items: Array<Omit<IDraftItem, 'key'>> }

    name.value = saved.name
    kind.value = saved.kind
    items.value = saved.items.map(item => ({ ...item, key: nextKey() }))
    selected.value = null
  }

  return {
    locale, name, kind, fields, items, status, saving, saved, error, uploading, selected, current, dirty,
    add, duplicate, remove, move, moveTo, select, reset, missingIn, missingTitles,
    submit, back, pickImage, clearImage, discardImage, useStored, mediaLibrary,
  }
}
