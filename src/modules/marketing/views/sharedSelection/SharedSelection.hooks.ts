import { useMarketingRepository } from '~/modules/marketing/repositories'
import { tourFromTrip } from '~/modules/leads/helpers/quote'
import { daysOf } from '~/modules/marketing/helpers/ad'
import type { AdLanguage, IAdCopy, IAdTour } from '~/modules/marketing/contracts/marketing'
import type { ITripRoute } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSharedSelection = () => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const { shared } = useMarketingRepository()

  const code = computed(() => String(route.params.code ?? '').toLowerCase())

  const { data, status } = useAsyncData(
    () => `marketing:shared:${code.value}`,
    () => shared(code.value).catch(() => null),
    { default: () => null, watch: [code] },
  )

  const selection = computed(() => data.value)

  const copy = computed<IAdCopy | null>(() => {
    const all = selection.value?.copy ?? {}

    return all[locale.value as AdLanguage] ?? all.ru ?? null
  })

  const tours = computed(() => [...(selection.value?.tours ?? [])]
    .sort((a, b) => a.price_amount - b.price_amount)
    .map(trip => ({ trip, tour: tourFromTrip(trip, trip.offer_id), route: routeOf(trip) })))

  const headline = computed(() => copy.value?.headline || selection.value?.title || t('marketing.page.title'))

  const facts = computed(() => {
    const list = selection.value?.tours ?? []
    const nights = [...new Set(list.map(trip => trip.nights))].sort((a, b) => a - b)
    const shortest = nights[0] ?? 0
    const longest = nights[nights.length - 1] ?? 0
    const language = (locale.value === 'uz' ? 'uz' : 'ru') as AdLanguage

    return [
      daysOf(list.map(trip => trip.check_in), language),
      shortest !== longest
        ? t('marketing.nightsRange', { from: shortest, to: longest })
        : shortest ? t('marketing.nights', { n: shortest }, shortest) : '',
    ].filter(Boolean).join(' · ')
  })

  const checked = computed(() => {
    const at = selection.value?.checked_at

    return at ? t('marketing.page.checked', { date: new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long' }).format(new Date(at)) }) : ''
  })

  function routeOf(trip: IAdTour): ITripRoute {
    return {
      from: String(trip.route_from ?? ''),
      to: String(trip.route_to ?? ''),
      toLabel: String(trip.route_to_label ?? ''),
      kidAges: Array.isArray(trip.kid_ages) ? trip.kid_ages as number[] : [],
    }
  }

  return { selection, status, copy, tours, headline, facts, checked, code }
}
