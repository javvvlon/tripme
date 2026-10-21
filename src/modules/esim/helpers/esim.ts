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

export const usdOf = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)

const ALIASES: Record<string, string> = {
  'оаэ': 'AE', 'эмираты': 'AE', 'дубай': 'AE', 'uae': 'AE', 'baa': 'AE',
  'сша': 'US', 'америка': 'US', 'usa': 'US',
  'турция': 'TR', 'turkey': 'TR', 'turkiya': 'TR', 'türkiye': 'TR', 'анталья': 'TR', 'стамбул': 'TR',
  'южная корея': 'KR', 'корея': 'KR', 'korea': 'KR',
  'великобритания': 'GB', 'англия': 'GB', 'uk': 'GB',
  'бали': 'ID', 'занзибар': 'TZ', 'шарм-эль-шейх': 'EG', 'хургада': 'EG', 'пхукет': 'TH', 'паттайя': 'TH',
  'доминикана': 'DO', 'чехия': 'CZ',
}

export function esimCountryOf(text: string | null | undefined, codes: string[]): string | null {
  const wanted = (text ?? '').trim().toLowerCase()

  if (!wanted) return null

  const alias = ALIASES[wanted]

  if (alias) return codes.includes(alias) ? alias : null

  for (const code of codes) {
    if (wanted === code.toLowerCase()) return code

    for (const locale of ['ru', 'uz', 'en']) {
      if (countryName(code, locale).toLowerCase() === wanted) return code
    }
  }

  return null
}
