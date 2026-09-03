/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

/**
 * Today where the person is sitting, as `YYYY-MM-DD`.
 *
 * Not `toISOString()`: that is UTC, and an agent in Tashkent filing an order
 * at eight in the evening would have it dated yesterday.
 */
export const today = (at: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
}
