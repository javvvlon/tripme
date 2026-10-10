import type { FieldValue } from '~/shared/helpers/numbers'
import { DEFAULT_BRANCH } from '~/modules/leads/config/orders'
import { DEFAULT_CURRENCY } from '~/shared/helpers/money'
import { today } from '~/shared/helpers/dates'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import { tripFromLead, tripFromTour } from '~/modules/leads/helpers/trip'
import { HOME_DEPARTURE } from '~/shared/composables/useSearchCriteria'
import type { ILeadRaw, ILeadRelated, IOrderRaw, ITripRoute, LeadStatus } from '~/modules/leads/contracts/leads'
import type { ITravellers } from '~/shared/components/travellersPicker/TravellersPicker.d'
import type { ITourPickerCriteria } from '~/modules/leads/components/tourPicker/TourPicker.d'
import type { Tour } from '~/search_engine/models/Tour'

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

  const picking = ref(false)

  const hasTour = computed(() => Boolean(lead.value?.hotel_name))

  const pickerSeed = computed<Partial<ITourPickerCriteria>>(() => {
    const found = lead.value

    if (!found) return {}

    return {
      from: found.route_from || HOME_DEPARTURE,
      to: found.route_to || found.destination,
      date: found.check_in ?? '',
      nights: found.nights || undefined,
      adults: found.adults || undefined,
      kids: found.children,
    }
  })

  async function assign(tour: Tour | null, searched: ITripRoute | null) {
    if (!tour || !lead.value) return

    if (hasTour.value && !await ask({
      title: t('cms.leads.offer.confirmTitle'),
      description: t('cms.leads.offer.confirmText', { hotel: lead.value.hotel_name }),
      confirmLabel: t('cms.leads.offer.confirm'),
    })) return

    if (await save({ trip: tripFromTour(tour, searched ?? undefined) }, t('cms.leads.offer.assigned'))) picking.value = false
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

  const change = (next: LeadStatus) => save({ status: next })

  const submit = () => save({
    destination: draft.destination,
    planned_dates: draft.plannedDates,
    adults: draft.party.adults,
    children_ages: draft.party.kidAges,
    budget_amount: asAmount(draft.budgetAmount),
    budget_currency: draft.budgetCurrency,
    reject_reason: draft.rejectReason,
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
    picking, hasTour, pickerSeed, assign, clearTour,
    tripDone, finished, lastOrder, related, requesting, startRequest, creatingOrder,
  }
}
