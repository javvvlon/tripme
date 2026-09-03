/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LEAD_STATUSES = ['new', 'in_progress', 'quote_sent', 'won', 'rejected'] as const

export const ORDER_STATUSES = [
  'draft', 'requested', 'confirmed', 'paid', 'issued', 'travelling', 'completed',
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]

export const LEAD_SORTS = [
  'order', 'created', 'client', 'phone', 'tour',
  'dates', 'party', 'price', 'supplier', 'status',
] as const

export type LeadSort = typeof LEAD_SORTS[number]

export type SortDirection = 'asc' | 'desc'

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
  source: 'site' | 'manual'
  status: LeadStatus
  reject_reason: string
  channel: string
  destination: string
  planned_dates: string
  party_size: number
  budget_amount: number | null
  budget_currency: string
  manager_id: string | null
  manager_name: string
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
}

export const emptyManualDraft = (): ILeadManualDraft => ({
  firstName: '',
  lastName: '',
  phone: '',
  comment: '',
})

export interface IOrderRaw {
  uuid: string
  order_no: number
  lead_id: string
  status: OrderStatus
  traveller_name: string
  country: string
  deal_date: string | null
  return_date: string | null
  manager_id: string | null
  branch: string
  supplier_order_id: string
  passport_id: string
  passport_expires_at: string | null
  hotel_name: string
  supplier_name: string
  check_in: string | null
  nights: number
  adults: number
  children: number
  price_amount: number | null
  price_currency: string
  trip: Record<string, unknown>
  note: string
  created_at: string
  updated_at: string
}

export interface IOrderEvent {
  from: OrderStatus | null
  to: OrderStatus
  actor_id: string | null
  at: string
}

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['requested'],
  requested: ['confirmed', 'draft'],
  confirmed: ['paid', 'requested'],
  paid: ['issued'],
  issued: ['travelling'],
  travelling: ['completed'],
  completed: [],
}

/**
 * A file that belongs to an order: one the system wrote, or one an agent
 * attached.
 */
export type DocumentKind = 'offer' | 'invoice' | 'attachment'

export interface IOrderDocument {
  id: string
  order_id: string
  kind: DocumentKind
  name: string
  url: string
  size: number
  created_at: string
}
