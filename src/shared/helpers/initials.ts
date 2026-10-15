/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase()
