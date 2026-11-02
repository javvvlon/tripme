/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SITE_NAME = 'TripMe'

export const OG_IMAGE = { path: '/og-image.jpg', width: 1200, height: 630 } as const

export const PUBLIC_PAGES = ['', '/blog', '/contact', '/legal/offer', '/legal/privacy', '/legal/terms'] as const

export const PRIVATE_PATHS = ['/app', '/account', '/auth', '/register', '/esim/order', '/esim/pay'] as const

export const CRAWL_CLOSED_PATHS = ['/app'] as const

const PRIVATE = new RegExp(`^/[a-z]{2}(${PRIVATE_PATHS.join('|')})(/|$)`)

export const isPrivatePath = (path: string): boolean => PRIVATE.test(path.split('?')[0] ?? '')
