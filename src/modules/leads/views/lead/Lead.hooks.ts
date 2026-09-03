import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import { tripFromLead } from '~/modules/leads/helpers/trip'
import type { ILeadRaw, IOrderRaw, LeadStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLead = () => {
  const { t } = useI18n()
  const { failed, saved: cheer, fail, loadFailed } = useToast()
  const { ask } = useConfirm()
  const route = useRoute()
  const localePath = useLocalePath()

  const {
    one, patch, remove: removeLead,
    ordersFor, createOrder,
  } = useLeadsRepository()

  const id = computed(() => String(route.params.id ?? ''))

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const orders = ref<IOrderRaw[]>([])

  const draft = reactive({
    destination: '',
    plannedDates: '',
    partySize: '',
    budgetAmount: '',
    budgetCurrency: '',
    rejectReason: '',
    comment: '',
  })

  const adopt = (found: ILeadRaw) => {
    draft.destination = found.destination
    draft.plannedDates = found.planned_dates
    draft.partySize = String(found.party_size || '')
    draft.budgetAmount = found.budget_amount === null ? '' : String(found.budget_amount)
    draft.budgetCurrency = found.budget_currency
    draft.rejectReason = found.reject_reason
    draft.comment = found.comment
  }

  const { data: lead, status, refresh } = useAsyncData<ILeadRaw | null>(
    'cms:lead',
    async () => {
      try {
        const found = await one(id.value)

        adopt(found)
        orders.value = await ordersFor(id.value)

        return found
      }
      catch {
        error.value = loadFailed(t('cms.errors.load'))

        return null
      }
    },
    { default: () => null },
  )

  const statusOptions = computed(() =>
    LEAD_STATUSES.map(value => ({ value, label: t(`cms.leads.status.${value}`) })))

  async function save(body: Parameters<typeof patch>[1]) {
    error.value = ''
    saved.value = false
    saving.value = true

    try {
      const next = await patch(id.value, body)

      lead.value = next
      adopt(next)
      saved.value = true
      cheer()
    }
    catch (e) {
      error.value = failed(e)
    }
    finally {
      saving.value = false
    }
  }

  const change = (next: LeadStatus) => save({ status: next })

  const submit = () => save({
    destination: draft.destination,
    planned_dates: draft.plannedDates,
    party_size: draft.partySize.trim() === '' ? 0 : Number(draft.partySize),
    budget_amount: draft.budgetAmount.trim() === '' ? null : Number(draft.budgetAmount),
    budget_currency: draft.budgetCurrency,
    reject_reason: draft.rejectReason,
    comment: draft.comment,
  })

  async function addOrder() {
    if (!lead.value) return

    error.value = ''

    try {
      const created = await createOrder(id.value, tripFromLead(lead.value))

      await navigateTo(localePath(`/app/orders/${created.uuid}`))
    }
    catch (e) {
      error.value = failed(e)
    }
  }

  async function remove() {
    if (!await ask({
      title: t('cms.leads.confirmDelete.title'),
      description: t('cms.leads.confirmDelete.lead'),
      subject: [lead.value?.first_name, lead.value?.last_name].filter(Boolean).join(' ') || undefined,
    })) return

    error.value = ''

    try {
      await removeLead(id.value)
      await navigateTo(localePath('/app/leads'))
    }
    catch (e) {
      error.value = failed(e)
    }
  }

  return {
    lead, draft, orders, status, error, saving, saved,
    statusOptions, change, submit, addOrder, remove, refresh,
  }
}
