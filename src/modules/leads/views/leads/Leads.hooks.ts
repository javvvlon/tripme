import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLeads = () => {
  const { t } = useI18n()
  const { all, setStatus, remove: removeLead } = useLeadsRepository()

  const filter = ref<LeadStatus | ''>('')
  const error = ref('')
  const expanded = ref<string | null>(null)

  const { data, status, refresh } = useAsyncData(
    'cms:leads',
    () => all(filter.value),
    { default: () => [] as ILeadRaw[], watch: [filter] },
  )

  const statusOptions = computed(() => [
    { value: '', label: t('cms.leads.filters.all') },
    ...LEAD_STATUSES.map(value => ({ value, label: t(`cms.leads.status.${value}`) })),
  ])

  const rowOptions = computed(() =>
    LEAD_STATUSES.map(value => ({ value, label: t(`cms.leads.status.${value}`) })))

  const counts = computed(() => {
    const rows = data.value ?? []

    return {
      total: rows.length,
      fresh: rows.filter(row => row.status === 'new').length,
    }
  })

  async function change(lead: ILeadRaw, next: LeadStatus) {
    if (lead.status === next) return

    error.value = ''

    try {
      await setStatus(lead.uuid, next)
      await refresh()
    }
    catch {
      error.value = t('cms.errors.save')
    }
  }

  async function remove(id: string) {
    error.value = ''

    try {
      await removeLead(id)
      await refresh()
    }
    catch {
      error.value = t('cms.errors.save')
    }
  }

  const toggle = (id: string) => {
    expanded.value = expanded.value === id ? null : id
  }

  return {
    leads: data, status, error, filter, expanded,
    statusOptions, rowOptions, counts,
    change, remove, toggle, refresh,
  }
}
