/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const today = (at: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
}
