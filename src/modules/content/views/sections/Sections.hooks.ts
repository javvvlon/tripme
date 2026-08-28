import { useContentRepository } from '~/modules/content/repositories'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { parseGrid } from '~/shared/helpers/grid'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { SECTION_VARIANTS } from '~/modules/content/contracts/blocks'
import type { SectionVariant } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDraftSection {
  key: string
  link: string
  variant: SectionVariant
  listId: string
  layoutId: string
  isPublished: boolean
  titles: Record<ContentLocale, string>
}

const blankTitles = () => Object.fromEntries(
  CONTENT_LOCALES.map(locale => [locale, '']),
) as Record<ContentLocale, string>

let counter = 0
const nextKey = () => `section-${++counter}`

export const useSections = () => {
  const { t } = useI18n()
  const { sections, lists, layouts, saveSections } = useContentRepository()

  const locale = ref<ContentLocale>('en')
  const draft = ref<IDraftSection[]>([])

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const loaded = ref(false)

  const { data, status } = useAsyncData('cms:sections', async () => {
    const [current, allLists, allLayouts] = await Promise.all([sections(), lists(), layouts()])

    if (loaded.value) return { lists: allLists, layouts: allLayouts }

    loaded.value = true

    draft.value = current.map(section => ({
      key: section.uuid,
      link: section.link ?? '',
      variant: section.variant ?? 'list',
      listId: section.list_id ?? '',
      layoutId: section.layout_id,
      isPublished: section.is_published,
      titles: {
        ...blankTitles(),
        ...Object.fromEntries(section.translations.map(tr => [tr.locale, tr.title])),
      },
    }))

    return { lists: allLists, layouts: allLayouts }
  }, { default: () => ({ lists: [], layouts: [] }) })

  const variantOptions = computed(() => SECTION_VARIANTS.map(value => ({
    value,
    label: t(`cms.sections.variants.${value}`),
  })))

  const listOptions = computed(() => (data.value?.lists ?? []).map(list => ({
    value: list.uuid,
    label: list.name,
    hint: t('cms.lists.items', { count: list.items_count }),
  })))

  const layoutOptions = computed(() => (data.value?.layouts ?? []).map(layout => ({
    value: layout.uuid,
    label: layout.name || layout.grid,
    hint: layout.grid,
  })))

  const capacityOf = (layoutId: string): number | null => {
    const layout = (data.value?.layouts ?? []).find(item => item.uuid === layoutId)

    return parseGrid(layout?.grid)?.capacity ?? null
  }

  const itemsIn = (listId: string): number | null =>
    (data.value?.lists ?? []).find(list => list.uuid === listId)?.items_count ?? null

  const add = () => {
    draft.value = [...draft.value, {
      key: nextKey(),
      link: '',
      variant: 'list',
      listId: data.value?.lists[0]?.uuid ?? '',
      layoutId: data.value?.layouts[0]?.uuid ?? '',
      isPublished: true,
      titles: blankTitles(),
    }]
  }

  const remove = (key: string) => {
    draft.value = draft.value.filter(section => section.key !== key)
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= draft.value.length) return

    const next = [...draft.value]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    draft.value = next
  }

  async function submit() {
    error.value = ''
    saved.value = false

    const incomplete = draft.value.find(section =>
      !section.layoutId || (section.variant === 'list' && !section.listId))

    if (incomplete) {
      error.value = t('cms.sections.pickRequired')
      return
    }

    const untitled = draft.value.find(section =>
      !CONTENT_LOCALES.some(code => section.titles[code].trim()))

    if (untitled) {
      error.value = t('cms.sections.titleRequired')
      return
    }

    saving.value = true

    try {
      await saveSections(draft.value.map(section => ({
        link: section.link.trim() || null,
        variant: section.variant,
        list_id: section.variant === 'posts' ? null : section.listId,
        layout_id: section.layoutId,
        is_published: section.isPublished,
        translations: CONTENT_LOCALES.map(code => ({ locale: code, title: section.titles[code] })),
      })))

      saved.value = true
    }
    catch {
      error.value = t('cms.errors.save')
    }
    finally {
      saving.value = false
    }
  }

  return {
    locale, draft, status, saving, saved, error,
    variantOptions, listOptions, layoutOptions, capacityOf, itemsIn,
    add, remove, move, submit,
  }
}
