/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAccountNavItem {
  key: string
  labelKey: string
  icon: string
  to: string
  prefix?: string
}

export const ACCOUNT_NAVIGATION: IAccountNavItem[] = [
  { key: 'orders', labelKey: 'account.nav.orders', icon: 'briefcase', to: '/account', prefix: '/account/orders' },
  { key: 'points', labelKey: 'account.nav.points', icon: 'medal', to: '/account/points' },
  { key: 'profile', labelKey: 'account.nav.profile', icon: 'user', to: '/account/profile' },
]
