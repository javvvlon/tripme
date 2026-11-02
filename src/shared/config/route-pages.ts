/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ROUTE_PAGES_PATH = '/tours'

const SLUG = /^([a-z]+)-([a-z][a-z-]*)$/

export interface IRouteSlug {
  from: string
  to: string
}

export const routePagePath = (from: string, to: string): string => `${ROUTE_PAGES_PATH}/${from}-${to}`

export function parseRouteSlug(slug: string): IRouteSlug | null {
  const match = SLUG.exec(slug)

  return match ? { from: match[1]!, to: match[2]! } : null
}
