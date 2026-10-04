import type { DayPrice } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDayPricesProps {
  from: string
  to: string
  days: DayPrice[]
  loading?: boolean
}

export interface IDayCell {
  iso: string
  weekday: string
  label: string
  price: string
  cheapest: boolean
  empty: boolean
}
