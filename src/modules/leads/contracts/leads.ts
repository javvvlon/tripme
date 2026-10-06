/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LEAD_STATUSES = ['new', 'in_progress', 'quote_sent', 'won', 'rejected'] as const

export const ORDER_STATUSES = [
  'draft', 'requested', 'confirmed', 'paid', 'issued', 'travelling', 'completed', 'cancelled',
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]

export const LEAD_SORTS = [
  'order', 'created', 'client', 'phone', 'tour',
  'dates', 'party', 'price', 'supplier', 'status',
] as const

export type LeadSort = typeof LEAD_SORTS[number]

export type SortDirection = 'asc' | 'desc'

export type LeadStatus = typeof LEAD_STATUSES[number]

export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['in_progress', 'quote_sent', 'rejected'],
  in_progress: ['quote_sent', 'won', 'rejected'],
  quote_sent: ['in_progress', 'won', 'rejected'],
  won: ['in_progress', 'rejected'],
  rejected: [],
}

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
  ref: string
  first_response_at: string | null
  consent_at: string | null
  source: 'site' | 'manual'
  status: LeadStatus
  reject_reason: string
  channel: string
  user_id: string | null
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
  consent?: boolean
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
  ref: string
  cancel_reason: string
  lead_id: string
  status: OrderStatus
  traveller_name: string
  country: string
  deal_date: string | null
  return_date: string | null
  manager_id: string | null
  manager_name: string
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
  actor_name: string | null
  at: string
}

export type LeadEventKind = 'created' | 'taken' | 'assigned' | 'status' | 'order_assigned'

export interface ILeadEvent {
  kind: LeadEventKind
  from: string | null
  to: string | null
  from_name: string | null
  to_name: string | null
  subject: string | null
  actor_id: string | null
  actor_name: string | null
  at: string
}

export interface IStaffMember {
  uuid: string
  name: string
  role: string
}

export type ManagerFilter = 'all' | 'me' | 'none' | string

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['requested', 'cancelled'],
  requested: ['confirmed', 'draft', 'cancelled'],
  confirmed: ['paid', 'requested', 'cancelled'],
  paid: ['issued', 'cancelled'],
  issued: ['travelling', 'cancelled'],
  travelling: ['completed'],
  completed: [],
  cancelled: [],
}

export const PASSPORT_CHECKED: OrderStatus[] = ['confirmed', 'paid', 'issued', 'travelling']

export const PASSPORT_MARGIN_MONTHS = 6

export const RESPONSE_SLA_MINUTES = 15

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
