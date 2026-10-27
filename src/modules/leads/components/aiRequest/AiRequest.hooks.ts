import { useLeadsRepository } from '~/modules/leads/repositories'
import { destinationsOf, planQuery, roomsOf } from '~/modules/leads/helpers/ai-search'
import type { IPlanTarget } from '~/modules/leads/helpers/ai-search'
import { FLEXIBLE_NIGHTS } from '~/search_engine/intentions/search'
import { formatMoney } from '~/shared/utils/format'
import { useHotelLabels } from '~/shared/composables/useHotelLabels'
import type { ILeadSearchDestination, ILeadSearchPlan } from '~/modules/leads/contracts/leads'
import type { Money } from '~/search_engine/contracts/search'
import type { IAiRequestFact, IAiRequestProps, IAiRequestSearch } from './AiRequest.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAiRequest = (props: IAiRequestProps) => {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const { aiSearch } = useLeadsRepository()
  const { remember } = useHotelLabels()

  const plan = ref<ILeadSearchPlan | null>(null)
  const reading = ref(false)
  const error = ref('')

  watch(() => props.lead.uuid, () => {
    plan.value = null
    error.value = ''
  })

  const read = async () => {
    if (reading.value) return

    reading.value = true
    error.value = ''

    try {
      plan.value = await aiSearch(props.lead.uuid, locale.value)
    }
    catch (failure) {
      const status = (failure as { status?: number, statusCode?: number } | null)
      const code = status?.status ?? status?.statusCode

      error.value = code === 503 ? t('cms.leads.ai.unavailable') : code === 400 ? t('cms.leads.ai.empty') : t('cms.leads.ai.failed')
    }
    finally {
      reading.value = false
    }
  }

  const dates = (from: string, to: string): string => {
    const format = new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', timeZone: 'UTC' })
    const start = new Date(`${from}T00:00:00Z`)

    return to && to !== from ? format.formatRange(start, new Date(`${to}T00:00:00Z`)) : format.format(start)
  }

  const nights = (value: number | null): string =>
    value === null || value === FLEXIBLE_NIGHTS.around
      ? t('search.nightsRange', { from: FLEXIBLE_NIGHTS.from, to: FLEXIBLE_NIGHTS.to })
      : t('search.nights', { n: value }, value)

  const partyOf = (adults: number, kidAges: number[]): string => {
    const parts = [t('search.adults', { n: adults }, adults)]

    if (kidAges.length) parts.push(`${t('search.kids', { n: kidAges.length }, kidAges.length)} (${kidAges.join(', ')})`)

    return parts.join(', ')
  }

  const destinations = computed(() => (plan.value ? destinationsOf(plan.value) : []))

  const several = computed(() => destinations.value.length > 1)

  const routeOf = (destination: ILeadSearchDestination): string => {
    const place = [destination.to?.label || destination.country, destination.resort].filter(Boolean).join(' · ')

    return [plan.value?.from?.label, place || t('cms.leads.ai.anywhere')].filter(Boolean).join(' → ')
  }

  const hotelsOf = (destination: ILeadSearchDestination): string[] =>
    destination.hotels.map(hotel => (hotel.stars ? `${hotel.name} ${hotel.stars}★` : hotel.name))

  const missingOf = (destination: ILeadSearchDestination): string[] =>
    destination.missing_hotels.length ? [t('cms.leads.ai.missingHotels', { names: destination.missing_hotels.join(', ') })] : []

  const placeHints = (destination: ILeadSearchDestination): string[] => {
    if (!destination.to) return [t('cms.leads.ai.noDestination')]

    return destination.resort && destination.areas && !destination.areas.length ? [t('cms.leads.ai.resortMissing', { resort: destination.resort })] : []
  }

  const rooms = computed(() => {
    const found = plan.value
    const split = found?.crowded ? roomsOf(found.adults, found.kid_ages) : []

    return split.length > 1 ? split : []
  })

  const searches = computed<IAiRequestSearch[]>(() => {
    if (!several.value && !rooms.value.length) return []

    const parties = rooms.value.length ? rooms.value : [undefined]

    return destinations.value.flatMap((destination, place) => parties.map((room, index) => {
      const roomLine = room ? partyOf(room.adults, room.kidAges) : ''
      const first = index === 0

      if (!several.value) {
        return { key: `${place}-${index}`, title: t('cms.leads.ai.room', { n: index + 1 }), lines: [roomLine], hints: [], destination, room }
      }

      return {
        key: `${place}-${index}`,
        title: routeOf(destination),
        lines: [
          ...(room ? [`${t('cms.leads.ai.room', { n: index + 1 })} · ${roomLine}`] : []),
          ...(first ? hotelsOf(destination) : []),
        ],
        hints: first
          ? [...(destination.note ? [destination.note] : []), ...missingOf(destination), ...placeHints(destination)]
          : [],
        destination,
        room,
      }
    }))
  })

  const facts = computed<IAiRequestFact[]>(() => {
    const found = plan.value
    const main = destinations.value[0]

    if (!found || !main) return []

    const rows: IAiRequestFact[] = []

    if (!several.value) {
      rows.push({ key: 'route', icon: 'plane', lines: [routeOf(main)], hints: placeHints(main) })
    }

    rows.push(
      {
        key: 'dates',
        icon: 'calendar',
        lines: [`${dates(found.date_from, found.date_to)} · ${nights(found.nights)}`],
        hints: found.dates_assumed ? [t('cms.leads.ai.datesAssumed')] : [],
      },
      {
        key: 'party',
        icon: 'users',
        lines: [partyOf(found.adults, found.kid_ages)],
        hints: [
          ...(found.ages_assumed ? [t('cms.leads.ai.agesAssumed')] : []),
          ...(found.crowded ? [t(rooms.value.length ? 'cms.leads.ai.split' : 'cms.leads.ai.crowded')] : []),
        ],
      },
    )

    if (!several.value && (main.hotels.length || main.missing_hotels.length)) {
      rows.push({
        key: 'hotels',
        icon: 'bed',
        lines: main.hotels.length ? hotelsOf(main) : [t('cms.leads.ai.noHotels')],
        hints: missingOf(main),
      })
    }

    if (!destinations.value.some(destination => destination.hotels.length) && found.stars.length) {
      rows.push({ key: 'stars', icon: 'star', lines: [found.stars.map(star => `${star}★`).join(', ')], hints: [] })
    }

    if (found.meals.length) {
      rows.push({ key: 'meals', icon: 'list', lines: [found.meals.map(meal => t(`filters.mealPlans.${meal}`)).join(', ')], hints: [] })
    }

    if (found.budget) {
      const amount = formatMoney({ amount: found.budget.amount, currency: found.budget.currency as Money['currency'] }, locale.value)

      rows.push({
        key: 'budget',
        icon: 'tag',
        lines: [found.budget.basis ? t(`cms.leads.ai.budget.${found.budget.basis}`, { amount }) : amount],
        hints: [],
      })
    }

    return rows
  })

  const notes = computed(() => {
    const found = plan.value

    if (!found) return []

    const all = [found.note, ...(several.value ? [] : [destinations.value[0]?.note ?? ''])].map(note => note.trim()).filter(Boolean)

    return [...new Set(all)]
  })

  const ready = computed(() => Boolean(destinations.value[0]?.to))

  const go = (target: IPlanTarget = {}) => {
    const found = plan.value

    if (!found) return

    for (const hotel of (target.destination ?? destinations.value[0])?.hotels ?? []) remember(hotel.key, hotel.name)

    void navigateTo({ path: localePath('/search'), query: planQuery(found, props.lead.uuid, target) })
  }

  const dismiss = () => {
    plan.value = null
  }

  return { plan, reading, error, facts, notes, searches, several, ready, read, go, dismiss }
}
