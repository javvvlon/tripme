import { Model } from '~/shared/helpers/model'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { IPageMetaDraft, PageSeoRaw } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class PageMeta extends Model<IPageMetaDraft> {
  protected static override mapRaw(raw: { seo?: PageSeoRaw }): IPageMetaDraft {
    return {
      seo: Object.fromEntries(CONTENT_LOCALES.map(locale => [locale, {
        title: raw?.seo?.[locale]?.title ?? '',
        description: raw?.seo?.[locale]?.description ?? '',
      }])) as Record<ContentLocale, { title: string, description: string }>,
    }
  }
}
