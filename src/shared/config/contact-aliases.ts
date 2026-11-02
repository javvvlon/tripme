import { LOCALES } from './locales'
import type { TLocale } from './locales'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CONTACT_PATH = '/contact'

export const CONTACT_ALIASES = ['contacts', 'kontakty', 'aloqa', 'contact-us'] as const

const ALIAS = new RegExp(`^(?:/(${LOCALES.join('|')}))?/(${[...CONTACT_ALIASES, 'contact'].join('|')})/?$`, 'i')

const isLocale = (value: string | undefined): value is TLocale =>
  LOCALES.includes(value as TLocale)

export function contactRedirect(path: string, preferred?: string): string | null {
  const match = ALIAS.exec(path)

  if (!match) return null

  const [, prefix, slug] = match

  if (prefix && slug === 'contact') return null

  const locale = prefix?.toLowerCase() ?? (isLocale(preferred) ? preferred : LOCALES[0])

  return `/${locale}${CONTACT_PATH}`
}
