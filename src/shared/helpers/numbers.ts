/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 *
 * Reading numbers out of form fields.
 *
 * A field can hand back either a string or a number: Vue casts the value of
 * `<input type="number">` to a number as soon as someone types in it, while
 * the same field holds a string until then. Anything here that assumed one
 * or the other broke on save.
 */
export type FieldValue = string | number | null | undefined

/** What a form field actually holds while someone is editing it. */
export type FieldInput = string | number

const parse = (value: FieldValue): number | null => {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const trimmed = value.trim()

  if (!trimmed) return null

  const parsed = Number(trimmed)

  return Number.isFinite(parsed) ? parsed : null
}

/** A whole count of people or nights. Empty or nonsense reads as none. */
export const asCount = (value: FieldValue): number => {
  const parsed = parse(value)

  return parsed === null ? 0 : Math.max(0, Math.trunc(parsed))
}

/** An amount of money, where empty means "not said" rather than zero. */
export const asAmount = (value: FieldValue): number | null => parse(value)
