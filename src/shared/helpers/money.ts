/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CURRENCIES = ['USD', 'EUR', 'UZS'] as const

export type Currency = typeof CURRENCIES[number]

export const DEFAULT_CURRENCY: Currency = 'USD'

/** A narrow space, so a price never breaks across a line mid-number. */
const GROUP = ' '

const DECIMALS = 2

/**
 * Everything typed that is not part of a number, gone.
 *
 * A comma is read as a decimal point, because on a Russian keyboard that is
 * the key under the finger — unless a dot is present too, which means the
 * comma was grouping a pasted price like `1,480.50` and dropping it would
 * have turned that into 1.48.
 */
export const priceDigits = (value: string): string => {
  const separated = value.includes('.') && value.includes(',')
    ? value.replace(/,/g, '')
    : value.replace(/,/g, '.')

  const cleaned = separated.replace(/[^\d.]/g, '')
  const [whole = '', ...rest] = cleaned.split('.')

  if (!rest.length) return whole

  return `${whole}.${rest.join('').slice(0, DECIMALS)}`
}

/** Groups the whole part, leaving a half-typed decimal alone. */
export const formatPrice = (digits: string): string => {
  if (!digits) return ''

  const [whole, fraction] = digits.split('.')
  const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, GROUP)

  return fraction === undefined ? grouped : `${grouped}.${fraction}`
}

/** What the field holds, as something the API can store. */
export const priceValue = (digits: string): number | null => {
  if (!digits || digits === '.') return null

  const parsed = Number(digits)

  return Number.isFinite(parsed) ? parsed : null
}

/** What a stored amount looks like in the field. */
export const priceInput = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return ''

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return ''

  /** Trailing zeros are noise in a field someone is about to edit. */
  return String(parsed)
}
