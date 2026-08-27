/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IValidationMessage {
  key: string
  params?: Record<string, unknown>
}

export type ValidationRule<TValue = any, TForm = any> = (
  value: TValue,
  form: TForm,
) => IValidationMessage | null

export type ValidationRules<TForm> = Partial<Record<keyof TForm, ValidationRule<any, TForm>[]>>

const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined || value === false) return true
  if (typeof value === 'string') return !value.trim()
  if (Array.isArray(value)) return !value.length

  return false
}

const message = (key: string, params?: Record<string, unknown>): IValidationMessage => ({ key, params })

export const required = (key = 'validation.required'): ValidationRule =>
  value => (isEmpty(value) ? message(key) : null)

const optional = (check: ValidationRule): ValidationRule =>
  (value, form) => (isEmpty(value) ? null : check(value, form))

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const email = (key = 'validation.email'): ValidationRule =>
  optional(value => (EMAIL.test(String(value).trim()) ? null : message(key)))

const PHONE = /^\+?[\d\s\-()]{7,20}$/

export const phone = (key = 'validation.phone'): ValidationRule =>
  optional(value => (PHONE.test(String(value).trim()) ? null : message(key)))

export const minLength = (n: number, key = 'validation.minLength'): ValidationRule =>
  optional(value => (String(value).length >= n ? null : message(key, { n })))

export const maxLength = (n: number, key = 'validation.maxLength'): ValidationRule =>
  optional(value => (String(value).length <= n ? null : message(key, { n })))

export const pattern = (regex: RegExp, key = 'validation.pattern'): ValidationRule =>
  optional(value => (regex.test(String(value)) ? null : message(key)))

export const sameAs = <TForm>(field: keyof TForm, key = 'validation.sameAs'): ValidationRule<unknown, TForm> =>
  (value, form) => (value === form[field] ? null : message(key))

export const custom = <TValue, TForm>(
  predicate: (value: TValue, form: TForm) => boolean,
  key: string,
  params?: Record<string, unknown>,
): ValidationRule<TValue, TForm> =>
  (value, form) => (predicate(value, form) ? null : message(key, params))
