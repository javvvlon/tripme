import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const HOT_DAYS = 5

export const LEAD_HOURS = 18

export const HOT_SHARE = 0.88

const MIN_GROUP = 5

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const tashkentToday = (now = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

export const daysUntil = (day: string, today: string): number =>
  Math.round((Date.parse(`${day.slice(0, 10)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)

export function isHotDeparture(checkIn: string, stopped: boolean, today = tashkentToday(), days = HOT_DAYS): boolean {
  if (stopped || !ISO_DATE.test(checkIn.slice(0, 10))) return false

  const left = daysUntil(checkIn, today)

  return left >= 1 && left <= days
}

export function earliestDeparture(now = new Date()): string {
  const tomorrow = tashkentToday(new Date(now.getTime() + 24 * 60 * 60 * 1000))
  const lead = tashkentToday(new Date(now.getTime() + LEAD_HOURS * 60 * 60 * 1000))

  return lead > tomorrow ? lead : tomorrow
}

const nightly = (tour: Tour): number =>
  (tour.get('uzs')?.amount ?? tour.get('comparablePrice').amount) / Math.max(1, tour.get('nights'))

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

export function hotPicks(tours: Tour[]): Set<string> {
  const groups = new Map<number, number[]>()

  for (const tour of tours) {
    const stars = tour.stars()

    if (stars >= 2) groups.set(stars, [...(groups.get(stars) ?? []), nightly(tour)])
  }

  const medians = new Map([...groups].filter(([, prices]) => prices.length >= MIN_GROUP).map(([stars, prices]) => [stars, median(prices)]))

  return new Set(tours
    .filter((tour) => {
      const typical = medians.get(tour.stars())

      return Boolean(typical) && tour.isHot() && nightly(tour) <= typical! * HOT_SHARE
    })
    .map(tour => tour.get('id')))
}
