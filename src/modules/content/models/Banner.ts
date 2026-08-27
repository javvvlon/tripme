import { Model } from '~/shared/helpers/model'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale, IBannerRaw, IBannerTranslation } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBanner {
  id: string | null
  translations: Record<ContentLocale, IBannerTranslation>
}

const empty = (): IBannerTranslation => ({ title: '', subtitle: '', imageUrl: null })

export class Banner extends Model<IBanner> {
  protected static override mapRaw(raw: IBannerRaw): IBanner {
    const translations = Object.fromEntries(
      CONTENT_LOCALES.map(locale => [locale, empty()]),
    ) as Record<ContentLocale, IBannerTranslation>

    for (const item of raw?.translations ?? []) {
      if (!CONTENT_LOCALES.includes(item.locale)) continue

      translations[item.locale] = {
        title: item.title ?? '',
        subtitle: item.subtitle ?? '',
        imageUrl: item.image_url ?? null,
      }
    }

    return { id: raw?.id ?? null, translations }
  }

  public isEmpty(): boolean {
    return CONTENT_LOCALES.every((locale) => {
      const t = this.get('translations')[locale]

      return !t.title && !t.imageUrl
    })
  }
}
