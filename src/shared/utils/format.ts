import type { Money } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export function formatMoney(money: Money, locale = 'ru'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount)
}

export function formatCompactAmount(amount: number, locale = 'ru'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDateRange(startISO: string, nights: number, locale = 'ru'): string {
  const start = new Date(startISO)
  if (Number.isNaN(start.getTime())) return ''

  const end = new Date(start)
  end.setDate(end.getDate() + nights)

  const format = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' })
  return `${format.format(start)} — ${format.format(end)}`
}

export function formatDistance(metres: number, locale = 'ru'): string {
  return metres >= 1000
    ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(metres / 1000)} km`
    : `${metres} m`
}
