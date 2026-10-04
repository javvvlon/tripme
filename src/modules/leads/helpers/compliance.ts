import { PASSPORT_MARGIN_MONTHS, RESPONSE_SLA_MINUTES } from '~/modules/leads/contracts/leads'
import type { ILeadRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILeadResponse {
  minutes: number
  overdue: boolean
  answered: boolean
}

const MINUTE = 60_000

export function leadResponse(lead: Pick<ILeadRaw, 'status' | 'created_at' | 'first_response_at'>, now: number): ILeadResponse {
  const created = new Date(lead.created_at).getTime()

  if (lead.first_response_at) {
    const minutes = Math.max(0, Math.round((new Date(lead.first_response_at).getTime() - created) / MINUTE))

    return { minutes, overdue: minutes > RESPONSE_SLA_MINUTES, answered: true }
  }

  const minutes = Math.max(0, Math.round((now - created) / MINUTE))

  return { minutes, overdue: lead.status === 'new' && minutes > RESPONSE_SLA_MINUTES, answered: false }
}

const isoPlus = (iso: string, days: number, months = 0): string => {
  const at = new Date(`${iso}T00:00:00Z`)

  at.setUTCMonth(at.getUTCMonth() + months)
  at.setUTCDate(at.getUTCDate() + days)

  return at.toISOString().slice(0, 10)
}

export function tripEnd(order: { return_date: string | null, check_in: string | null, nights: number }): string | null {
  if (order.return_date) return order.return_date
  if (order.check_in) return isoPlus(order.check_in, order.nights || 0)

  return null
}

export function passportProblem(
  order: { return_date: string | null, check_in: string | null, nights: number, passport_expires_at: string | null },
): 'expired' | 'short' | null {
  const end = tripEnd(order)

  if (!order.passport_expires_at || !end) return null
  if (order.passport_expires_at <= end) return 'expired'
  if (order.passport_expires_at < isoPlus(end, 0, PASSPORT_MARGIN_MONTHS)) return 'short'

  return null
}

export function waitLabel(minutes: number, t: (key: string, values?: Record<string, unknown>) => string): string {
  if (minutes < 60) return t('cms.leads.sla.minutes', { n: minutes })

  const hours = Math.floor(minutes / 60)

  if (hours < 48) return t('cms.leads.sla.hours', { h: hours, m: minutes % 60 })

  return t('cms.leads.sla.days', { n: Math.floor(hours / 24) })
}
