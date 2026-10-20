import type { FieldValue } from '~/shared/helpers/numbers'
import { DEFAULT_BRANCH } from '~/modules/leads/config/orders'
import { DEFAULT_CURRENCY } from '~/shared/helpers/money'
import { today } from '~/shared/helpers/dates'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { isRejectReason, LEAD_STATUSES, REJECT_REASONS } from '~/modules/leads/contracts/leads'
import { tripFromLead } from '~/modules/leads/helpers/trip'
import type { ILeadRaw, ILeadRelated, ILeadTrip, IOrderRaw, LeadStatus, RejectReason } from '~/modules/leads/contracts/leads'
import type { ITravellers } from '~/shared/components/travellersPicker/TravellersPicker.d'

const DEFAULT_ADULTS = 2

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
    one, patch, archive: archiveLead, restore: restoreLead,
    ordersFor, createOrder, newRequest, related: relatedOf,
  } = useLeadsRepository()

  const id = computed(() => String(route.params.id ?? ''))

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const orders = ref<IOrderRaw[]>([])
  const related = ref<ILeadRelated[]>([])
  const historyVersion = ref(0)

  const draft = reactive({
    destination: '',
    plannedDates: '',
    party: { adults: DEFAULT_ADULTS, kidAges: [] } as ITravellers,
    budgetAmount: '' as FieldValue,
    budgetCurrency: '',
    rejectReason: '',
    comment: '',
  })

  const adopt = (found: ILeadRaw) => {
    draft.destination = found.destination
    draft.plannedDates = found.planned_dates
    draft.party = { adults: found.adults || DEFAULT_ADULTS, kidAges: [...(found.children_ages ?? [])] }
    draft.budgetAmount = found.budget_amount === null ? '' : String(found.budget_amount)
    draft.budgetCurrency = found.budget_currency
    draft.rejectReason = found.reject_reason
    draft.comment = found.comment
  }

  const { data: lead, status, refresh } = useAsyncData<ILeadRaw | null>(
    () => `cms:lead:${id.value}`,
    async () => {
      try {
        const found = await one(id.value)

        const [leadOrders, others] = await Promise.all([
          ordersFor(id.value),
          relatedOf(id.value).catch(() => [] as ILeadRelated[]),
        ])

        adopt(found)
        orders.value = leadOrders
        related.value = others

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

  async function save(body: Parameters<typeof patch>[1], message?: string) {
    error.value = ''
    saved.value = false
    saving.value = true

    try {
      const next = await patch(id.value, body)

      lead.value = next
      adopt(next)
      historyVersion.value++
      saved.value = true
      cheer(message)
      return true
    }
    catch (e) {
      error.value = failed(e)
      return false
    }
    finally {
      saving.value = false
    }
  }

  const pickingEsim = ref(false)

  const hasTour = computed(() => Boolean(lead.value?.hotel_name))

  async function assignEsim(trip: ILeadTrip) {
    if (!lead.value) return

    if (hasTour.value && !await ask({
      title: t('cms.leads.offer.confirmTitle'),
      description: t('cms.leads.offer.confirmText', { hotel: lead.value.hotel_name }),
      confirmLabel: t('cms.leads.offer.confirm'),
    })) return

    if (await save({ trip }, t('cms.leads.offer.assignedEsim'))) pickingEsim.value = false
  }

  async function clearTour() {
    if (!lead.value || !await ask({
      title: t('cms.leads.offer.clearTitle'),
      description: t('cms.leads.offer.clearText', { hotel: lead.value.hotel_name }),
      confirmLabel: t('cms.leads.offer.clearConfirm'),
      tone: 'danger',
    })) return

    await save({ trip: null }, t('cms.leads.offer.cleared'))
  }

  const CLOSED_ORDERS = ['completed', 'cancelled']

  const tripDone = computed(() => orders.value.length > 0 && orders.value.every(order => CLOSED_ORDERS.includes(order.status)))

  const finished = computed(() => Boolean(lead.value) && (tripDone.value || lead.value?.status === 'rejected'))

  const lastOrder = computed(() => orders.value.at(-1) ?? null)

  const requesting = ref(false)

  async function startRequest() {
    if (!lead.value || requesting.value) return

    error.value = ''
    requesting.value = true

    try {
      const created = await newRequest(id.value)

      cheer(t('cms.leads.next.created', { ref: created.ref }))

      await navigateTo(localePath(`/app/leads/${created.uuid}`))
    }
    catch (e) {
      error.value = failed(e)
    }
    finally {
      requesting.value = false
    }
  }

  const rejecting = ref(false)
  const rejectPick = ref<RejectReason | ''>('')

  function change(next: LeadStatus) {
    if (next !== 'rejected') return save({ status: next })

    rejectPick.value = isRejectReason(draft.rejectReason) ? draft.rejectReason : ''
    rejecting.value = true
  }

  async function confirmReject() {
    if (!rejectPick.value) return

    await save({ status: 'rejected', reject_reason: rejectPick.value })

    if (!error.value) rejecting.value = false
  }

  const reasonOptions = computed(() => REJECT_REASONS.map(value => ({ value, label: t(`cms.leads.rejectReasons.${value}`) })))

  const legacyReason = computed(() => (draft.rejectReason && !isRejectReason(draft.rejectReason) ? draft.rejectReason : ''))

  const submit = () => save({
    destination: draft.destination,
    planned_dates: draft.plannedDates,
    adults: draft.party.adults,
    children_ages: draft.party.kidAges,
    budget_amount: asAmount(draft.budgetAmount),
    budget_currency: draft.budgetCurrency,
    ...(isRejectReason(draft.rejectReason) ? { reject_reason: draft.rejectReason } : {}),
    comment: draft.comment,
  })

  const creatingOrder = ref(false)

  async function addOrder() {
    if (!lead.value || !hasTour.value || creatingOrder.value) return

    error.value = ''
    creatingOrder.value = true

    try {
      const trip = tripFromLead(lead.value)

      const created = await createOrder(id.value, {
        ...trip,
        price_currency: trip.price_currency || DEFAULT_CURRENCY,
      }, {
        deal_date: today(),
        branch: DEFAULT_BRANCH,
      })

      cheer(t('cms.orders.created'))

      await navigateTo(localePath(`/app/orders/${created.uuid}`))
    }
    catch (e) {
      error.value = failed(e)
      creatingOrder.value = false
    }
  }

  async function archive() {
    if (!await ask({
      title: t('cms.archive.leadTitle'),
      description: t('cms.archive.leadText'),
      subject: [lead.value?.first_name, lead.value?.last_name].filter(Boolean).join(' ') || undefined,
      confirmLabel: t('cms.archive.confirm'),
    })) return

    await setArchived(true)
  }

  const restore = () => setArchived(false)

  async function setArchived(archived: boolean) {
    error.value = ''

    try {
      lead.value = archived ? await archiveLead(id.value) : await restoreLead(id.value)
      historyVersion.value++
      cheer(archived ? t('cms.archive.leadDone') : t('cms.archive.restored'))
    }
    catch (e) {
      error.value = failed(e)
    }
  }

  async function owned(next: ILeadRaw) {
    lead.value = next
    historyVersion.value++
    orders.value = await ordersFor(id.value).catch(() => orders.value)
  }

  return {
    lead, draft, orders, status, error, saving, saved, historyVersion,
    statusOptions, change, submit, addOrder, archive, restore, refresh, owned,
    rejecting, rejectPick, confirmReject, reasonOptions, legacyReason,
    pickingEsim, hasTour, assignEsim, clearTour,
    tripDone, finished, lastOrder, related, requesting, startRequest, creatingOrder,
  }
}
