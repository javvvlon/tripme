/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type FieldValue = string | number | null | undefined

export type FieldInput = string | number

const parse = (value: FieldValue): number | null => {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const trimmed = value.trim()

  if (!trimmed) return null

  const parsed = Number(trimmed)

  return Number.isFinite(parsed) ? parsed : null
}

export const asCount = (value: FieldValue): number => {
  const parsed = parse(value)

  return parsed === null ? 0 : Math.max(0, Math.trunc(parsed))
}

export const asAmount = (value: FieldValue): number | null => parse(value)
