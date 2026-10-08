/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const flagOf = (code: string): string =>
  code.toUpperCase().replace(/./g, letter => String.fromCodePoint(127397 + letter.charCodeAt(0)))

export const countryName = (code: string, locale: string): string => {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase()) ?? code
  }
  catch {
    return code
  }
}

export const sumOf = (value: number, locale: string, unit: string): string =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ${unit}`
