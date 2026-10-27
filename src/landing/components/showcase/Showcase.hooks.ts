import { useShowcaseRepository } from '~/search_engine/repositories'
import { SHOWCASE_THEMES } from '~/search_engine/contracts/showcase'
import type { IShowcaseCard, IShowcasePlace, ShowcaseTheme } from '~/search_engine/contracts/showcase'
import { nightsRange } from '~/search_engine/intentions/search'
import { readCriteria } from '~/shared/composables/useSearchCriteria'
import { readFilters } from '~/shared/composables/useSearchFilters'
import { useHotelLabels } from '~/shared/composables/useHotelLabels'
import { formatDayRange, formatMoney } from '~/shared/utils/format'
import type { IShowcaseView } from './Showcase.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const SKELETONS = 3

export const useShowcase = () => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()
  const { stream } = useShowcaseRepository()
  const { approxUzs, uzsLabel } = useUzsRates()
  const { remember } = useHotelLabels()

  const theme = computed<ShowcaseTheme>(() => {
    const value = String(route.query.theme ?? '')

    return SHOWCASE_THEMES.includes(value as ShowcaseTheme) ? value as ShowcaseTheme : 'all'
  })

  const criteria = computed(() => readCriteria(route.query))
  const meals = computed(() => readFilters(route.query).meals)

  const request = computed<Record<string, string>>(() => {
    const { from, date, dateTo, nights, adults, kidAges } = criteria.value
    const query: Record<string, string> = { from, adults: String(adults) }
    const range = nightsRange(nights)

    if (theme.value !== 'all') query.theme = theme.value
    if (date) query.date = date
    if (date && dateTo) query.dateTo = dateTo
    if (range.nights) query.nights = String(range.nights)
    if (range.nightsTo) query.nightsTo = String(range.nightsTo)
    if (kidAges.length) query.children = kidAges.join(',')
    if (meals.value.length) query.meals = meals.value.join(',')

    return query
  })

  const from = ref<IShowcasePlace | null>(null)
  const span = ref({ date: '', dateTo: '' })
  const countries = ref<IShowcasePlace[]>([])
  const cards = shallowRef<IShowcaseCard[]>([])
  const streaming = ref(false)
  const failed = ref(false)

  let stop: (() => void) | null = null

  const run = () => {
    stop?.()
    cards.value = []
    countries.value = []
    failed.value = false
    streaming.value = true

    stop = stream(request.value, (event) => {
      if (event.type === 'start') {
        from.value = event.from
        span.value = { date: event.date, dateTo: event.dateTo }
        countries.value = event.countries
      }
      else if (event.type === 'country') {
        cards.value = [...cards.value, event.card]
      }
      else {
        cards.value = event.cards
        streaming.value = false
      }
    }, (received) => {
      streaming.value = false
      failed.value = !received || !cards.value.length
    })
  }

  onMounted(run)

  watch(request, (next, previous) => {
    if (JSON.stringify(next) !== JSON.stringify(previous)) run()
  })

  onBeforeUnmount(() => stop?.())

  const ordered = computed(() => [...cards.value].sort(theme.value === 'discount'
    ? (a, b) => b.discount - a.discount || a.tour.rankPrice() - b.tour.rankPrice()
    : (a, b) => a.tour.rankPrice() - b.tour.rankPrice()))

  const linkOf = (card: IShowcaseCard): string => {
    const { nights, adults, kidAges } = criteria.value
    const query: Record<string, string> = {
      from: request.value.from!,
      to: card.country.slug,
      date: span.value.date,
      dateTo: span.value.dateTo,
      nights: String(nights),
      adults: String(adults),
    }

    if (kidAges.length) query.kids = kidAges.join(',')
    if (meals.value.length) query.meals = meals.value.join(',')
    if (theme.value === 'discount') query.hotels = card.tour.groupKey()
    if (typeof route.query.lead === 'string') query.lead = route.query.lead

    return `${localePath('/search')}?${new URLSearchParams(query).toString()}`
  }

  const savingOf = (card: IShowcaseCard): string => {
    if (!card.discount) return ''

    return card.discountKind === 'median'
      ? t('showcase.belowMedian', { percent: card.discount, stars: card.tour.stars() })
      : t('showcase.discount', { percent: card.discount })
  }

  const views = computed<IShowcaseView[]>(() => ordered.value.map((card) => {
    const tour = card.tour
    const uzs = tour.get('uzs')

    return {
      ...card,
      link: linkOf(card),
      price: formatMoney(tour.get('comparablePrice'), locale.value),
      priceUzs: uzs ? uzsLabel(uzs.amount) : approxUzs(tour.get('comparablePrice')),
      when: `${formatDayRange(tour.get('checkIn'), '', locale.value)} · ${t('search.nights', { n: tour.get('nights') }, tour.get('nights'))}`,
      saving: savingOf(card),
    }
  }))

  const skeletons = computed(() => (streaming.value ? Math.max(0, Math.min(SKELETONS, countries.value.length - cards.value.length || SKELETONS)) : 0))

  const party = computed(() => {
    const { adults, kidAges } = criteria.value
    const parts = [t('search.adults', { n: adults }, adults)]

    if (kidAges.length) parts.push(`${t('search.kids', { n: kidAges.length }, kidAges.length)} (${kidAges.join(', ')})`)

    return parts.join(', ')
  })

  const summary = computed(() => [
    span.value.date ? formatDayRange(span.value.date, span.value.dateTo, locale.value) : '',
    party.value,
    meals.value.map(meal => t(`filters.mealPlans.${meal}`)).join(', '),
  ].filter(Boolean).join(' · '))

  const title = computed(() => t(`showcase.title.${theme.value}`, { city: from.value?.label ?? '' }))

  const open = (card: IShowcaseView) => {
    if (theme.value === 'discount') remember(card.tour.groupKey(), card.tour.displayName())
  }

  return { theme, title, summary, views, countries, streaming, failed, skeletons, run, open }
}
