/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 *
 * Formatting a date that might not be one.
 *
 * `Intl.DateTimeFormat` throws a RangeError on an invalid date, and a throw
 * inside a template stops Vue re-rendering that subtree — the page freezes on
 * whatever it last drew. One missing field should cost a dash, not a page.
 */
export const formatDate = (
  value: string | number | Date | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  fallback = '—',
): string => {
  if (value === null || value === undefined || value === '') return fallback

  const at = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(at.getTime())) return fallback

  return new Intl.DateTimeFormat(locale, options).format(at)
}
