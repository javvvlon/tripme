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
  { key: 'messages', labelKey: 'account.nav.messages', icon: 'mail', to: '/account/messages' },
  { key: 'travellers', labelKey: 'account.nav.travellers', icon: 'users', to: '/account/travellers' },
  { key: 'esim', labelKey: 'account.nav.esim', icon: 'mobile', to: '/account/esim' },
  { key: 'points', labelKey: 'account.nav.points', icon: 'medal', to: '/account/points' },
  { key: 'profile', labelKey: 'account.nav.profile', icon: 'user', to: '/account/profile' },
]
