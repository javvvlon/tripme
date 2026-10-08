import { useLeadsRepository } from '~/modules/leads/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import type { ILeadRaw, LeadSort, LeadStatus, SortDirection } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLeads = () => {
  const { t } = useI18n()
  const { fail, loadFailed } = useToast()
  const { page: leadsPage, setStatus } = useLeadsRepository()
  const { managerFilter, filterOptions, elevated, me } = useManagers('leads')
  const { page, perPage, pageQuery, setPage, setPerPage, toFirst } = usePageQuery()

  const query = ref('')
  const sort = ref<LeadSort>('order')
  const direction = ref<SortDirection>('desc')

  const error = ref('')

  const debounced = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (next) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => { debounced.value = next.trim() }, 300)
  })

  watch([debounced, sort, direction, managerFilter], toFirst)

  const { data, status, refresh } = useAsyncData(
    'cms:leads',
    () => leadsPage({ q: debounced.value, sort: sort.value, dir: direction.value, manager: managerFilter.value }, pageQuery.value),
    { default: () => null, watch: [debounced, sort, direction, managerFilter, pageQuery] },
  )

  const leads = computed<ILeadRaw[]>(() => data.value?.items ?? [])
  const pages = computed(() => data.value?.pages ?? 1)
  const total = computed(() => data.value?.total ?? 0)

  watch(data, (next) => {
    if (next && !next.items.length && next.page > next.pages) setPage(next.pages)
  })

  const rowOptions = computed(() =>
    LEAD_STATUSES.map(value => ({ value, label: t(`cms.leads.status.${value}`) })))

  const counts = computed(() => ({
    total: data.value?.counts.all ?? 0,
    fresh: data.value?.counts.fresh ?? 0,
  }))

  const TEXT_COLUMNS: LeadSort[] = ['client', 'tour', 'supplier', 'status', 'phone']

  function sortBy(column: LeadSort) {
    if (sort.value === column) {
      direction.value = direction.value === 'asc' ? 'desc' : 'asc'
      return
    }

    sort.value = column
    direction.value = TEXT_COLUMNS.includes(column) ? 'asc' : 'desc'
  }

  async function change(lead: ILeadRaw, next: LeadStatus) {
    if (lead.status === next) return

    error.value = ''

    try {
      await setStatus(lead.uuid, next)
      await refresh()
    }
    catch {
      error.value = fail(t('cms.errors.save'))
    }
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    leads, status, error, query, sort, direction,
    managerFilter, filterOptions, elevated, me,
    rowOptions, counts, sortBy, change, refresh,
    page, pages, total, perPage, setPage, setPerPage,
  }
}
