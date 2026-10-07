/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PER_PAGE_OPTIONS = [25, 50, 100] as const

export const DEFAULT_PER_PAGE = 25

export interface IPageRaw<T, C = Record<string, number>> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
  counts: C
}

export interface IPageQuery {
  page: number
  perPage: number
}
