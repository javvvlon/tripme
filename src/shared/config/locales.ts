/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LOCALES = ['ru', 'uz', 'en'] as const

export type TLocale = typeof LOCALES[number]
