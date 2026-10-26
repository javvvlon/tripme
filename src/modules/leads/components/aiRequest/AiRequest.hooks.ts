import { useLeadsRepository } from '~/modules/leads/repositories'
import { planQuery, roomsOf } from '~/modules/leads/helpers/ai-search'
import type { IPlanRoom } from '~/modules/leads/helpers/ai-search'
import { FLEXIBLE_NIGHTS } from '~/search_engine/intentions/search'
import { formatMoney } from '~/shared/utils/format'
import { useHotelLabels } from '~/shared/composables/useHotelLabels'
import type { ILeadSearchPlan } from '~/modules/leads/contracts/leads'
import type { Money } from '~/search_engine/contracts/search'
import type { IAiRequestFact, IAiRequestProps, IAiRequestRoom } from './AiRequest.d'

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

  const rooms = computed<IAiRequestRoom[]>(() => {
    const found = plan.value

    if (!found?.crowded) return []

    const split = roomsOf(found.adults, found.kid_ages)

    return split.length > 1
      ? split.map((room, index) => ({ label: t('cms.leads.ai.room', { n: index + 1 }), party: partyOf(room.adults, room.kidAges), room }))
      : []
  })

  const facts = computed<IAiRequestFact[]>(() => {
    const found = plan.value

    if (!found) return []

    const place = [found.to?.label || found.country, found.resort].filter(Boolean).join(' · ')

    const rows: IAiRequestFact[] = [
      {
        key: 'route',
        icon: 'plane',
        lines: [[found.from?.label, place || t('cms.leads.ai.anywhere')].filter(Boolean).join(' → ')],
        hints: found.to ? [] : [t('cms.leads.ai.noDestination')],
      },
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
    ]

    if (found.hotels.length || found.missing_hotels.length) {
      rows.push({
        key: 'hotels',
        icon: 'bed',
        lines: found.hotels.length
          ? found.hotels.map(hotel => (hotel.stars ? `${hotel.name} ${hotel.stars}★` : hotel.name))
          : [t('cms.leads.ai.noHotels')],
        hints: found.missing_hotels.length ? [t('cms.leads.ai.missingHotels', { names: found.missing_hotels.join(', ') })] : [],
      })
    }

    if (!found.hotels.length && found.stars.length) {
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

  const ready = computed(() => Boolean(plan.value?.to))

  const go = (room?: IPlanRoom) => {
    const found = plan.value

    if (!found) return

    for (const hotel of found.hotels) remember(hotel.key, hotel.name)

    void navigateTo({ path: localePath('/search'), query: planQuery(found, props.lead.uuid, room) })
  }

  const dismiss = () => {
    plan.value = null
  }

  return { plan, reading, error, facts, rooms, ready, read, go, dismiss }
}
