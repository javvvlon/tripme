/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const POINTS_CURRENCIES = ['USD', 'EUR', 'UZS'] as const

export type PointsCurrency = typeof POINTS_CURRENCIES[number]

export type PointsRates = Record<PointsCurrency, number>

export interface IPointsTier {
  id: string
  name: string
  threshold: number
  discount_percent: number
}

export interface IPointsTierDraft {
  name: string
  threshold: string | number
  discount_percent: string | number
}

export interface IPointsSummary {
  balance: number
  earned: number
  tier: IPointsTier | null
  next: IPointsTier | null
  to_next: number
}

export interface IPointsTransaction {
  id: string
  delta: number
  reason: 'order' | 'adjustment'
  order_id: string | null
  order_no: number | null
  order_ref: string | null
  note: string
  created_at: string
}

export interface IPointsOverview {
  tiers: IPointsTier[]
  rates: PointsRates
}

export interface ICustomerPoints {
  user: { id: string, name: string, email: string }
  summary: IPointsSummary
  history: IPointsTransaction[]
}

export interface IMyPoints {
  summary: IPointsSummary
  history: IPointsTransaction[]
  tiers: IPointsTier[]
}
