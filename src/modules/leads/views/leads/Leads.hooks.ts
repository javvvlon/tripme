import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import type { ILeadRaw, LeadSort, LeadStatus, SortDirection } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLeads = () => {
  const { t } = useI18n()
  const { fail, loadFailed } = useToast()
  const { all, setStatus } = useLeadsRepository()

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

  const { data, status, refresh } = useAsyncData(
    'cms:leads',
    () => all({ q: debounced.value, sort: sort.value, dir: direction.value }),
    { default: () => [] as ILeadRaw[], watch: [debounced, sort, direction] },
  )

  const rowOptions = computed(() =>
    LEAD_STATUSES.map(value => ({ value, label: t(`cms.leads.status.${value}`) })))

  const counts = computed(() => {
    const rows = data.value ?? []

    return { total: rows.length, fresh: rows.filter(row => row.status === 'new').length }
  })

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
    leads: data, status, error, query, sort, direction,
    rowOptions, counts, sortBy, change, refresh,
  }
}
