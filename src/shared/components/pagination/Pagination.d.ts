/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPaginationProps {
  page: number
  pages: number
  total: number
  perPage: number
  perPageOptions?: readonly number[]
}

export interface IPaginationEmits {
  'update:page': [page: number]
  'update:perPage': [perPage: number]
}

export type PaginationSlot = number | 'gap'
