/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export enum Locale {
  Ru = 'ru',
  Uz = 'uz',
  En = 'en',
}

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LOCALES = [Locale.Ru, Locale.Uz, Locale.En] as const
export const DEFAULT_LOCALE: Locale = Locale.Ru

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILocaleDescription {
  code: Locale
  iso: string
  label: string
}

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LOCALE_DESCRIPTIONS: ILocaleDescription[] = [
  { code: Locale.Ru, iso: 'ru-RU', label: 'Русский' },
  { code: Locale.Uz, iso: 'uz-UZ', label: 'O‘zbekcha' },
  { code: Locale.En, iso: 'en-US', label: 'English' },
]
