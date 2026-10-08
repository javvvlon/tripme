/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PAYMENT_DIRECTIONS = ['customer_in', 'customer_refund', 'supplier_out', 'supplier_refund'] as const

export type PaymentDirection = typeof PAYMENT_DIRECTIONS[number]

export const CUSTOMER_DIRECTIONS: PaymentDirection[] = ['customer_in', 'customer_refund']

export const PAYMENT_METHODS = ['cash', 'uzcard', 'humo', 'card', 'transfer'] as const

export type PaymentMethod = typeof PAYMENT_METHODS[number]

export const PAYMENT_CURRENCIES = ['UZS', 'USD', 'EUR'] as const

export type PaymentCurrency = typeof PAYMENT_CURRENCIES[number]

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid'

export interface IPaymentRaw {
  uuid: string
  item_id: string | null
  direction: PaymentDirection
  amount: number
  currency: PaymentCurrency
  fx_rate: number
  fx_date: string
  amount_uzs: number
  method: PaymentMethod
  paid_at: string
  note: string
  receipt: { name: string, url: string } | null
  reverses: string | null
  reversed: boolean
  recorded_by: string
  created_at: string
}

export interface IFinanceRaw {
  total_uzs: number
  missing_rates: number
  received_uzs: number
  balance_uzs: number
  overpaid_uzs: number
  paid_to_suppliers_uzs: number | null
  revenue_uzs: number | null
  deposit_percent: number
  deposit_uzs: number
  deposit_met: boolean
  payment_status: PaymentStatus
  legacy_paid: boolean
  can_reverse: boolean
  payments: IPaymentRaw[]
}

export interface IPaymentDraft {
  direction: PaymentDirection
  amount: number | null
  currency: PaymentCurrency
  fxRate: string
  method: PaymentMethod
  paidAt: string
  note: string
  receipt: File | null
}
