/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PHONE_COUNTRY_CODE = '998'

export const PHONE_NATIONAL_LENGTH = 9

export const phoneDigits = (value: string): string =>
  value.replace(/\D/g, '').replace(new RegExp(`^${PHONE_COUNTRY_CODE}`), '').slice(0, PHONE_NATIONAL_LENGTH)

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

export const isCompletePhone = (value: string): boolean =>
  phoneDigits(value).length === PHONE_NATIONAL_LENGTH

export const toE164 = (value: string): string => {
  const digits = phoneDigits(value)

  return digits ? `+${PHONE_COUNTRY_CODE}${digits}` : ''
}
