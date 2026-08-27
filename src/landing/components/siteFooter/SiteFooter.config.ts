/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const FOOTER_COLUMNS = [
  {
    titleKey: 'footer.countries',
    links: [
      { to: '/tours/russia', labelKey: 'country.russia' },
      { to: '/tours/uzbekistan', labelKey: 'country.uzbekistan' },
      { to: '/tours/turkey', labelKey: 'country.turkey' },
    ],
    more: { to: '/search', labelKey: 'footer.allCountries' },
  },
  {
    titleKey: 'footer.directions',
    links: [
      { to: '/tours/tashkent-moscow', labelKey: 'route.tashkentMoscow' },
      { to: '/tours/tashkent-istanbul', labelKey: 'route.tashkentIstanbul' },
      { to: '/tours/tashkent-kazan', labelKey: 'route.tashkentKazan' },
    ],
    more: { to: '/search', labelKey: 'footer.allDirections' },
  },
] as const

export const FOOTER_LEGAL = [
  { to: '/legal/privacy', labelKey: 'legal.privacy' },
  { to: '/legal/terms', labelKey: 'legal.terms' },
] as const
