/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ContentLocale = 'ru' | 'uz' | 'en'

export const CONTENT_LOCALES: ContentLocale[] = ['ru', 'uz', 'en']

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
