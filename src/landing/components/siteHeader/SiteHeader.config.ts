/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IHeaderNavItem {
  to: string
  labelKey: string
}

export const HEADER_NAV: IHeaderNavItem[] = [
  { to: '/blog', labelKey: 'nav.blog' },
  { to: '/contact', labelKey: 'nav.contacts' },
]
