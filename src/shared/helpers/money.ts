/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CURRENCIES = ['USD', 'EUR', 'UZS'] as const

export type Currency = typeof CURRENCIES[number]

export const DEFAULT_CURRENCY: Currency = 'USD'

const GROUP = ' '

const DECIMALS = 2

export const priceDigits = (value: string): string => {
  const separated = value.includes('.') && value.includes(',')
    ? value.replace(/,/g, '')
    : value.replace(/,/g, '.')

  const cleaned = separated.replace(/[^\d.]/g, '')
  const [whole = '', ...rest] = cleaned.split('.')

  if (!rest.length) return whole

  return `${whole}.${rest.join('').slice(0, DECIMALS)}`
}

export const formatPrice = (digits: string): string => {
  if (!digits) return ''

  const [whole, fraction] = digits.split('.')
  const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, GROUP)

  return fraction === undefined ? grouped : `${grouped}.${fraction}`
}

export const priceValue = (digits: string): number | null => {
  if (!digits || digits === '.') return null

  const parsed = Number(digits)

  return Number.isFinite(parsed) ? parsed : null
}

export const priceInput = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return ''

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return ''

  return String(parsed)
}
