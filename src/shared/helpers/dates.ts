/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const today = (at: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
}

export const fromIso = (iso: string): Date => new Date(`${iso}T00:00:00`)

export const addDays = (iso: string, days: number): string => {
  const at = fromIso(iso)

  at.setDate(at.getDate() + days)

  return today(at)
}

export const addMonths = (iso: string, months: number): string => {
  const at = fromIso(iso)

  at.setDate(1)
  at.setMonth(at.getMonth() + months)

  return today(at)
}

export const startOfMonth = (iso: string): string => `${iso.slice(0, 7)}-01`

export const monthLength = (iso: string): number => {
  const at = fromIso(iso)

  return new Date(at.getFullYear(), at.getMonth() + 1, 0).getDate()
}

export const monthOffset = (iso: string): number => {
  const weekday = fromIso(startOfMonth(iso)).getDay()

  return (weekday + 6) % 7
}
