import { useMarketingRepository } from '~/modules/marketing/repositories'
import type { ISelectionRow } from '~/modules/marketing/contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSelections = () => {
  const { t } = useI18n()
  const { list } = useMarketingRepository()
  const { page, perPage, pageQuery, setPage, setPerPage, toFirst } = usePageQuery()

  const query = ref('')
  const debounced = ref('')
  const scope = ref<'live' | 'archived'>('live')

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (next) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => { debounced.value = next.trim() }, 300)
  })

  watch([debounced, scope], toFirst)

  const { data, status } = useAsyncData(
    'cms:marketing',
    () => list({
      page: pageQuery.value.page,
      per_page: pageQuery.value.perPage,
      q: debounced.value || undefined,
      archived: scope.value === 'archived' ? '1' : undefined,
    }),
    { default: () => null, watch: [debounced, scope, pageQuery] },
  )

  const rows = computed<ISelectionRow[]>(() => data.value?.items ?? [])
  const pages = computed(() => data.value?.pages ?? 1)
  const total = computed(() => data.value?.total ?? 0)
  const counts = computed(() => ({ all: data.value?.counts?.all ?? 0, archived: data.value?.counts?.archived ?? 0 }))

  const tabs = computed(() => [
    { value: 'live', label: t('cms.marketing.title'), count: counts.value.all },
    { value: 'archived', label: t('cms.marketing.archived'), count: counts.value.archived },
  ])

  onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

  return { rows, status, query, scope, tabs, counts, page, pages, total, perPage, setPage, setPerPage }
}
