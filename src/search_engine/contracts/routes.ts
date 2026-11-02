import type { ITourRaw } from '~/search_engine/models/Tour'
import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IRoutePlace {
  slug: string
  label: string
}

export interface IRouteSummaryRaw {
  from: IRoutePlace
  to: IRoutePlace
  offers: number | null
  offer: ITourRaw | null
}

export interface IRoutePageRaw {
  from: IRoutePlace
  to: IRoutePlace
  date: string
  date_to: string
  nights: { from: number, to: number }
  adults: number
  offers: number
  cheapest: ITourRaw | null
  hotels: ITourRaw[]
}

export interface IRouteSummary {
  from: IRoutePlace
  to: IRoutePlace
  offers: number | null
  cheapest: Tour | null
}

export interface IRoutePage {
  from: IRoutePlace
  to: IRoutePlace
  date: string
  dateTo: string
  nights: { from: number, to: number }
  adults: number
  offers: number
  cheapest: Tour | null
  hotels: Tour[]
}
