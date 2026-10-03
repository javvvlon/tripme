/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IFooterLink {
  to: string
  labelKey: string
}

export interface IFooterColumn {
  titleKey: string
  links: readonly IFooterLink[]
  more?: IFooterLink
}

export interface IFooterSocial {
  id: string
  icon: string
  href: string
  labelKey: string
}

export interface IPaymentMethod {
  id: string
  label: string
  image?: string
}

export const FOOTER_COLUMNS: readonly IFooterColumn[] = [
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

export const FOOTER_COMPANY: readonly IFooterLink[] = [
  { to: '/about', labelKey: 'footer.about' },
  { to: '/blog', labelKey: 'footer.blog' },
  { to: '/contact', labelKey: 'footer.contacts' },
] as const

export const FOOTER_LEGAL: readonly IFooterLink[] = [
  { to: '/legal/privacy', labelKey: 'legal.privacy' },
  { to: '/legal/terms', labelKey: 'legal.terms' },
  { to: '/legal/offer', labelKey: 'legal.offer' },
] as const

export const FOOTER_SOCIALS: readonly IFooterSocial[] = [
  { id: 'telegram', icon: 'telegram', href: '', labelKey: 'footer.socials.telegram' },
  { id: 'instagram', icon: 'instagram', href: '', labelKey: 'footer.socials.instagram' },
  { id: 'facebook', icon: 'facebook', href: '', labelKey: 'footer.socials.facebook' },
] as const

export const PAYMENT_METHODS: readonly IPaymentMethod[] = [
  { id: 'uzcard', label: 'Uzcard' },
  { id: 'humo', label: 'Humo' },
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'secure', label: '3D Secure' },
] as const
