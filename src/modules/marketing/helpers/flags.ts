/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const ISO: Record<string, string> = {
  'azerbaijan': 'AZ', 'armenia': 'AM', 'velikobritaniya': 'GB', 'vengriya': 'HU', 'vietnam': 'VN', 'germaniya': 'DE', 'georgia': 'GE',
  'egypt': 'EG', 'zanzibar': 'TZ', 'india': 'IN', 'indonesia': 'ID', 'spain': 'ES', 'italy': 'IT', 'kazakhstan': 'KZ', 'qatar': 'QA',
  'keniya': 'KE', 'china': 'CN', 'mauritius': 'MU', 'malaysia': 'MY', 'maldives': 'MV', 'marokko': 'MA', 'uae': 'AE', 'oman': 'OM',
  'polsha': 'PL', 'saudovskaya-araviya': 'SA', 'seychelles': 'SC', 'singapore': 'SG', 'ssha': 'US', 'thailand': 'TH', 'tanzaniya': 'TZ',
  'turkey': 'TR', 'frantsiya': 'FR', 'czechia': 'CZ', 'shveytsariya': 'CH', 'srilanka': 'LK', 'yuzhnaya-koreya': 'KR', 'japan': 'JP',
  'uzbekistan': 'UZ',
}

export function flagOf(slug: string): string {
  const code = ISO[slug.trim().toLowerCase()]

  return code ? String.fromCodePoint(...[...code].map(letter => 0x1F1E6 + letter.charCodeAt(0) - 65)) : ''
}

export const flagsOf = (slugs: string[]): string => [...new Set(slugs.map(flagOf).filter(Boolean))].slice(0, 4).join(' ')
