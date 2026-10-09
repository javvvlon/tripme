import type { IOrderDocument, OrderStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ICustomerOrder {
  uuid: string
  order_no: number
  ref: string
  status: OrderStatus
  country: string
  hotel_name: string
  supplier_name: string
  check_in: string | null
  return_date: string | null
  nights: number
  adults: number
  children: number
  price_amount: number | null
  price_currency: string
  supplier_order_id: string
  manager: { name: string } | null
  total_uzs: number
  payment_status: string
  created_at: string
  updated_at: string
}

export interface ICustomerOrderEvent {
  from: OrderStatus | null
  to: OrderStatus
  at: string
}

export interface ICustomerService {
  kind: string
  title: string
  when: string
  price: string
  uzs: number | null
}

export interface ICustomerOrderDetail extends ICustomerOrder {
  history: ICustomerOrderEvent[]
  documents: IOrderDocument[]
  services: ICustomerService[]
  total_uzs: number
  received_uzs: number
  balance_uzs: number
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overpaid'
}

export interface ICustomerRequest {
  uuid: string
  ref: string
  status: string
  destination: string
  hotel_name: string
  check_in: string | null
  nights: number
  orders: number
  created_at: string
}

export interface ICustomerEsim {
  token: string
  number: number
  status: string
  country: string
  plan: { data_gb?: number | null, dataMb?: number | null, days?: number }
  price_uzs: number
  created_at: string
}

export interface ITraveller {
  id: string
  first_name: string
  last_name: string
  birth_date: string | null
  gender: string
  citizenship: string
  passport_number: string
  passport_expires_at: string | null
}

export type ITravellerDraft = Omit<ITraveller, 'id'>

export interface IProfileDraft {
  firstName: string
  lastName: string
  phone: string
}

export interface IPasswordDraft {
  current: string
  next: string
  confirm: string
}
