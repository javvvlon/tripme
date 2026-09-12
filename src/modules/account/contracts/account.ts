import type { IOrderDocument, OrderStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ICustomerOrder {
  uuid: string
  order_no: number
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
  created_at: string
  updated_at: string
}

export interface ICustomerOrderEvent {
  from: OrderStatus | null
  to: OrderStatus
  at: string
}

export interface ICustomerOrderDetail extends ICustomerOrder {
  history: ICustomerOrderEvent[]
  documents: IOrderDocument[]
}

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
