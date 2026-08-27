/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IReferenceItem {
  slug: string
  label: string
  code: string
}

export interface IRouteAnswer {
  items: IReferenceItem[]
  verified: boolean
  harvestedFor: string
}

export interface ICalendarMask {
  start: string
  horizon: string
  blocked: string[]
  scheduledUntil: string
  route: string
}

export interface IRouteConstraints {
  nights: number[]
  maxAdults: number
  maxChildren: number
  currencies: string[]
  calendar: ICalendarMask | null
}
