import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useRoutesRepository } from '~/search_engine/repositories/routes.repository'
import type { IRouteSummary } from '~/search_engine/contracts/routes'
import { parseRouteSlug, routePagePath } from '~/shared/config/route-pages'
import { SITE_NAME } from '~/shared/config/seo'
import { useSiteUrl } from '~/shared/composables/useSiteUrl'
import { formatDayRange, formatMoney } from '~/shared/utils/format'
import { SIBLING_ROUTES } from './Route.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IRouteLink {
  to: string
  label: string
  price: string
}

export const useRoutePage = async () => {
  const route = useRoute()
  const { t, te, locale } = useI18n()
  const localePath = useLocalePath()
  const { absolute } = useSiteUrl()
  const { isStaff } = useAuthSession()
  const { one, list } = useRoutesRepository()

  const slug = String(route.params.route ?? '')
  const parsed = parseRouteSlug(slug)

  if (!parsed) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

  const pageData = useAsyncData(`route-page-${slug}`, () => one(parsed.from, parsed.to))
  const routesData = useAsyncData('route-pages', () => list(), { default: () => [] as IRouteSummary[] })
  const page = pageData.data
  const routes = routesData.data

  const known = (key: string, fallback: string): string => (te(key) ? t(key) : fallback)

  const cityName = computed(() => known(`city.${page.value!.from.slug}`, page.value!.from.label))

  const countryName = computed(() => known(`country.${page.value!.to.slug}`, page.value!.to.label))

  const arrow = computed(() => t('routes.arrow', { from: cityName.value, to: countryName.value }))

  const heading = computed(() => {
    const from = `routes.from.${page.value!.from.slug}`
    const to = `routes.to.${page.value!.to.slug}`

    return te(from) && te(to)
      ? t('routes.heading', { from: t(from), to: t(to) })
      : t('routes.headingBare', { route: arrow.value })
  })

  const cheapest = computed(() => page.value!.cheapest)

  const price = computed(() => (cheapest.value ? formatMoney(cheapest.value.get('comparablePrice'), locale.value) : ''))

  const nights = computed(() => {
    const count = cheapest.value?.get('nights') ?? page.value!.nights.from

    return t('search.nights', { n: count }, count)
  })

  const party = computed(() => t('search.adults', page.value!.adults))

  const dates = computed(() => formatDayRange(page.value!.date, page.value!.dateTo, locale.value))

  const lead = computed(() => (price.value
    ? t('routes.lead', { price: price.value, nights: nights.value, party: party.value, dates: dates.value })
    : t('routes.leadBare', { dates: dates.value })))

  const offers = computed(() => t('routes.offers', { n: page.value!.offers }, page.value!.offers))

  const searchLink = computed(() => `/search?${new URLSearchParams({
    from: page.value!.from.slug,
    to: page.value!.to.slug,
    date: page.value!.date,
    dateTo: page.value!.dateTo,
  }).toString()}`)

  const cardRoute = computed(() => ({ from: page.value!.from.slug, to: page.value!.to.slug, toLabel: countryName.value, kidAges: [] }))

  const siblings = computed<IRouteLink[]>(() => (routes.value ?? [])
    .filter(item => item.from.slug === page.value!.from.slug && item.to.slug !== page.value!.to.slug)
    .sort((a, b) => (a.cheapest?.rankPrice() ?? Number.POSITIVE_INFINITY) - (b.cheapest?.rankPrice() ?? Number.POSITIVE_INFINITY))
    .slice(0, SIBLING_ROUTES)
    .map(item => ({
      to: routePagePath(item.from.slug, item.to.slug),
      label: known(`country.${item.to.slug}`, item.to.label),
      price: item.cheapest ? formatMoney(item.cheapest.get('comparablePrice'), locale.value) : '',
    })))

  const breadcrumbs = computed(() => [
    { label: t('nav.homeShort'), to: '/' },
    { label: arrow.value },
  ])

  const canonical = computed(() => absolute(localePath(routePagePath(page.value!.from.slug, page.value!.to.slug))))

  const description = computed(() => (price.value
    ? t('routes.seoDescription', { heading: heading.value, price: price.value, nights: nights.value, dates: dates.value })
    : t('routes.seoDescriptionBare', { heading: heading.value })))

  useSeoMeta({
    title: () => (price.value ? t('routes.seoTitle', { route: arrow.value, price: price.value }) : t('routes.seoTitleBare', { route: arrow.value })),
    description: () => description.value,
    ogTitle: () => heading.value,
    ogDescription: () => description.value,
    ogType: 'website',
    ogSiteName: SITE_NAME,
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonical.value }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': heading.value,
        'description': description.value,
        'url': canonical.value,
        'provider': { '@type': 'TravelAgency', 'name': SITE_NAME, 'url': absolute(localePath('/')) },
        ...(cheapest.value
          ? {
              offers: {
                '@type': 'AggregateOffer',
                'lowPrice': cheapest.value.get('comparablePrice').amount,
                'priceCurrency': cheapest.value.get('comparablePrice').currency,
                'offerCount': page.value!.offers,
                'availability': 'https://schema.org/InStock',
              },
            }
          : {}),
      }),
    }],
  }))

  await Promise.all([pageData, routesData])

  if (pageData.error.value || !page.value) {
    const status = (pageData.error.value as { statusCode?: number } | null)?.statusCode

    throw createError({ statusCode: status && status !== 404 ? status : 404, statusMessage: 'Page not found', fatal: true })
  }

  return { page, heading, lead, offers, cityName, searchLink, cardRoute, siblings, breadcrumbs, isStaff }
}
