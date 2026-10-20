/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const HOT_DAYS = 10

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const tashkentToday = (now = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

export const daysUntil = (day: string, today: string): number =>
  Math.round((Date.parse(`${day.slice(0, 10)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)

export function isHotDeparture(checkIn: string, stopped: boolean, today = tashkentToday(), days = HOT_DAYS): boolean {
  if (stopped || !ISO_DATE.test(checkIn.slice(0, 10))) return false

  const left = daysUntil(checkIn, today)

  return left >= 0 && left <= days
}
