/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ESIM_PAYMENT_METHODS = ['payme', 'click', 'card'] as const

export type EsimPaymentMethod = typeof ESIM_PAYMENT_METHODS[number]

export type EsimPurchaseStatus = 'awaiting_payment' | 'paid' | 'issued' | 'issue_failed' | 'cancelled'

export const ESIM_PURCHASE_STATUSES: EsimPurchaseStatus[] = ['awaiting_payment', 'paid', 'issued', 'issue_failed', 'cancelled']

export const POPULAR_ESIM_COUNTRIES = ['TR', 'AE', 'EG', 'TH', 'GE', 'MV']

export interface IEsimCountry {
  code: string
  plans: number
  from_uzs: number
}

export interface IEsimPlan {
  id: string
  country: string
  data_gb: number | null
  days: number
  networks: string[]
  price_uzs: number
}

export interface IEsimMethod {
  method: EsimPaymentMethod
  sandbox: boolean
}

export interface IIssuedEsim {
  providerRef: string
  iccid: string
  smdp: string
  activationCode: string
  lpa: string
  apn: string | null
  qrUrl: string | null
}

export interface IEsimPurchase {
  token: string
  number: number
  status: EsimPurchaseStatus
  country: string
  plan: IEsimPlan
  price_uzs: number
  email: string
  method: EsimPaymentMethod
  pay_url: string | null
  esim: IIssuedEsim | null
  created_at: string
}

export interface IEsimCheckout {
  planId: string
  email: string
  phone: string
  method: EsimPaymentMethod
  locale: string
}

export interface IEsimPurchaseRow {
  id: string
  number: number
  status: EsimPurchaseStatus
  country: string
  plan_title: string
  price_uzs: number
  margin_uzs: number
  email: string
  phone: string
  method: EsimPaymentMethod
  provider: string
  issue_error: string
  issue_attempts: number
  paid_at: string | null
  created_at: string
}
