/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ContentLocale = 'ru' | 'uz' | 'en'

export const CONTENT_LOCALES: ContentLocale[] = ['ru', 'uz', 'en']

export const CMS_DEFAULT_LOCALE: ContentLocale = 'ru'

export interface IBannerTranslationRaw {
  locale: ContentLocale
  title: string
  subtitle: string | null
  image_url: string | null
}

export interface IBannerRaw {
  id: string | null
  translations: IBannerTranslationRaw[]
}

export interface IBannerTranslation {
  title: string
  subtitle: string
  imageUrl: string | null
}

export type BannerDraft = Record<ContentLocale, IBannerTranslation>

export const preferredTranslation = <T extends { locale: ContentLocale }>(
  translations: T[] | null | undefined,
  matches: (translation: T) => boolean = () => true,
): T | null => {
  const found = translations?.filter(matches) ?? []

  for (const locale of [CMS_DEFAULT_LOCALE, ...CONTENT_LOCALES]) {
    const match = found.find(translation => translation.locale === locale)

    if (match) return match
  }

  return found[0] ?? null
}
