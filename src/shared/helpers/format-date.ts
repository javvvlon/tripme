/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
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
