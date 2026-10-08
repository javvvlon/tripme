import type { FieldInput, FieldValue } from '~/shared/helpers/numbers'
import { DEFAULT_BRANCH } from '~/modules/leads/config/orders'
import { DEFAULT_CURRENCY } from '~/shared/helpers/money'
import { today } from '~/shared/helpers/dates'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import { tripFromLead, tripFromTour } from '~/modules/leads/helpers/trip'
import { HOME_DEPARTURE } from '~/shared/composables/useSearchCriteria'
import type { ILeadRaw, IOrderRaw, ITripRoute, LeadStatus } from '~/modules/leads/contracts/leads'
import type { ITourPickerCriteria } from '~/modules/leads/components/tourPicker/TourPicker.d'
import type { Tour } from '~/search_engine/models/Tour'

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
  const historyVersion = ref(0)

  const draft = reactive({
    destination: '',
    plannedDates: '',
    partySize: '' as FieldInput,
    budgetAmount: '' as FieldValue,
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

  const change = (next: LeadStatus) => save({ status: next })

  const submit = () => save({
    destination: draft.destination,
    planned_dates: draft.plannedDates,
    party_size: asCount(draft.partySize),
    budget_amount: asAmount(draft.budgetAmount),
    budget_currency: draft.budgetCurrency,
    reject_reason: draft.rejectReason,
    comment: draft.comment,
  })

  async function addOrder() {
    if (!lead.value) return

    error.value = ''

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

  async function owned(next: ILeadRaw) {
    lead.value = next
    historyVersion.value++
    orders.value = await ordersFor(id.value).catch(() => orders.value)
  }

  return {
    lead, draft, orders, status, error, saving, saved, historyVersion,
    statusOptions, change, submit, addOrder, remove, refresh, owned,
    picking, hasTour, pickerSeed, assign, clearTour,
  }
}
