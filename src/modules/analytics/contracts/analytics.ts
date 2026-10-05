/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAnalyticsKpis {
  leads: number
  paidOrders: number
  revenueUsd: number
  averageOrderUsd: number | null
  conversion: number | null
  responseMedianMinutes: number | null
  responseWithinSla: number | null
}

export interface IAnalyticsMixRow {
  key: string
  orders: number
  revenueUsd: number
}

export interface IAnalyticsChannel {
  channel: string
  leads: number
  paid: number
  conversion: number | null
}

export interface IAnalyticsManager {
  id: string | null
  name: string
  leads: number
  responseMedianMinutes: number | null
  conversion: number | null
  paidOrders: number
  revenueUsd: number
}

export interface IAttentionList<T> {
  total: number
  items: T[]
}

export interface IAnalyticsReport {
  period: { from: string, to: string, days: number, previous: { from: string, to: string }, bucket: 'day' | 'week' }
  usdRate: number | null
  kpis: { current: IAnalyticsKpis, previous: IAnalyticsKpis }
  trend: Array<{ date: string, leads: number, paid: number, revenueUsd: number }>
  funnel: Array<{ key: 'leads' | 'answered' | 'deal' | 'paid' | 'completed', count: number }>
  rejections: Array<{ reason: string, count: number }>
  attention: {
    unanswered: IAttentionList<{ id: string, ref: string, name: string, minutes: number }>
    stuckRequests: IAttentionList<{ id: string, ref: string, hotel: string, hours: number }>
    departures: IAttentionList<{ id: string, ref: string, traveller: string, hotel: string, checkIn: string, problems: string[] }>
    cancellations: IAttentionList<{ id: string, ref: string, hotel: string, reason: string, at: string }>
  }
  mix: {
    destinations: IAnalyticsMixRow[]
    operators: IAnalyticsMixRow[]
    stars: IAnalyticsMixRow[]
    hotels: IAnalyticsMixRow[]
    channels: IAnalyticsChannel[]
  }
  managers: IAnalyticsManager[]
}

export type AnalyticsPreset = '7' | '30' | '90' | '365'
