import { HOME_PHONE_COUNTRY, MAIN_COUNTRY_OF_CODE, PHONE_COUNTRIES } from '~/shared/config/phone-countries'
import type { IPhoneCountry } from '~/shared/config/phone-countries'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PHONE_COUNTRY_CODE = '998'

export const PHONE_NATIONAL_LENGTH = 9

export const E164_MAX_DIGITS = 15

export const INTERNATIONAL_MIN_DIGITS = 6

export interface IPhoneParts {
  country: IPhoneCountry
  national: string
}

const digitsOf = (value: string): string => value.replace(/\D/g, '')

const HOME = PHONE_COUNTRIES.find(country => country.iso === HOME_PHONE_COUNTRY)!

export const phoneCountry = (iso: string): IPhoneCountry =>
  PHONE_COUNTRIES.find(country => country.iso === iso) ?? HOME

export const isInternationalPhone = (value: string): boolean =>
  value.trim().startsWith('+') && digitsOf(value).length > 0 && !digitsOf(value).startsWith(PHONE_COUNTRY_CODE)

export const phoneDigits = (value: string): string => {
  if (isInternationalPhone(value)) return `+${digitsOf(value).slice(0, E164_MAX_DIGITS)}`

  return digitsOf(value).replace(new RegExp(`^${PHONE_COUNTRY_CODE}`), '').slice(0, PHONE_NATIONAL_LENGTH)
}

export function splitPhone(value: string): IPhoneParts {
  if (!isInternationalPhone(value)) return { country: HOME, national: phoneDigits(value) }

  const digits = digitsOf(value).slice(0, E164_MAX_DIGITS)
  const matches = PHONE_COUNTRIES.filter(country => digits.startsWith(country.code))
  const code = matches.reduce((longest, country) => (country.code.length > longest.length ? country.code : longest), '')

  if (!code) return { country: HOME, national: '' }

  const national = digits.slice(code.length)
  const main = code === '7' && /^[67]/.test(national) ? 'KZ' : MAIN_COUNTRY_OF_CODE[code]

  return { country: phoneCountry(main ?? matches.find(country => country.code === code)!.iso), national }
}

export const joinPhone = (country: IPhoneCountry, national: string): string => {
  if (country.code === PHONE_COUNTRY_CODE) return digitsOf(national).slice(0, PHONE_NATIONAL_LENGTH)

  const digits = digitsOf(national).slice(0, E164_MAX_DIGITS - country.code.length)

  return digits ? `+${country.code}${digits}` : ''
}

export const formatPhone = (value: string): string => {
  const digits = phoneDigits(value)

  if (!digits) return ''

  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean)

  const [operator, ...rest] = parts

  return rest.length ? `(${operator}) ${rest.join('-')}` : `(${operator}`
}

export const formatNational = (national: string): string => {
  const digits = digitsOf(national)
  const groups = [digits.slice(0, 3), digits.slice(3, 6), ...(digits.slice(6).match(/\d{1,2}/g) ?? [])].filter(Boolean)
  const last = groups.at(-1)

  if (groups.length > 2 && last?.length === 1) groups.splice(-2, 2, `${groups.at(-2)}${last}`)

  return groups.join(' ')
}

export const isCompletePhone = (value: string): boolean => {
  if (!isInternationalPhone(value)) return phoneDigits(value).length === PHONE_NATIONAL_LENGTH

  const { national } = splitPhone(value)

  return national.length >= INTERNATIONAL_MIN_DIGITS
}

export const toE164 = (value: string): string => {
  const digits = phoneDigits(value)

  if (!digits || digits.startsWith('+')) return digits

  return `+${PHONE_COUNTRY_CODE}${digits}`
}
