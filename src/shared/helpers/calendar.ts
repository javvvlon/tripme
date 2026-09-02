import type { ICalendarMask } from '~/search_engine/contracts/references'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const asDay = (date: Date): string => date.toISOString().slice(0, 10)

export const nextDay = (day: string): string => {
  const date = new Date(`${day}T00:00:00Z`)

  date.setUTCDate(date.getUTCDate() + 1)

  return asDay(date)
}

/**
 * The soonest day the operators still fly, counted from `today`.
 *
 * A route arrived at without a date — a card on the home page, a shared
 * link — means "as soon as possible" rather than "no departure", so the
 * search needs a day to stand on.
 */
export function firstOpenDate(mask: ICalendarMask | null, today = asDay(new Date())): string {
  if (!mask) return ''

  const blocked = new Set(mask.blocked)
  const last = mask.scheduledUntil || mask.horizon

  let day = mask.start > today ? mask.start : today

  while (day <= last) {
    if (!blocked.has(day)) return day

    day = nextDay(day)
  }

  return ''
}
