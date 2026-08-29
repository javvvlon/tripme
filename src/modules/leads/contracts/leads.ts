/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LEAD_STATUSES = ['new', 'in_progress', 'booked', 'rejected'] as const

export type LeadStatus = typeof LEAD_STATUSES[number]

export interface ILeadTrip {
  hotel_name: string
  supplier_name: string
  check_in: string | null
  nights: number
  adults: number
  children: number
  price_amount: number | null
  price_currency: string
  route_from: string
  route_to: string
  [key: string]: unknown
}

export interface ILeadRaw {
  uuid: string
  order_id: number
  supplier_order_id: string
  source: 'site' | 'manual'
  status: LeadStatus
  first_name: string
  last_name: string
  phone: string
  comment: string
  locale: string
  hotel_name: string
  supplier_name: string
  check_in: string | null
  nights: number
  adults: number
  children: number
  price_amount: number | null
  price_currency: string
  route_from: string
  route_to: string
  trip: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ILeadDraft {
  firstName: string
  lastName: string
  phone: string
  comment: string
}

export interface ILeadManualDraft {
  firstName: string
  lastName: string
  phone: string
  comment: string
  hotelName: string
  supplierName: string
  checkIn: string
  nights: string
  adults: string
  children: string
  priceAmount: string
  priceCurrency: string
  routeFrom: string
  routeTo: string
  supplierOrderId: string
}

export const emptyManualDraft = (): ILeadManualDraft => ({
  firstName: '',
  lastName: '',
  phone: '',
  comment: '',
  hotelName: '',
  supplierName: '',
  checkIn: '',
  nights: '',
  adults: '',
  children: '',
  priceAmount: '',
  priceCurrency: 'USD',
  routeFrom: '',
  routeTo: '',
  supplierOrderId: '',
})
