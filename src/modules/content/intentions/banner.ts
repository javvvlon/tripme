import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { BannerDraft } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class BannerIntention {
  public toRequest(draft: BannerDraft): Record<string, unknown> {
    return {
      translations: CONTENT_LOCALES.map(locale => ({
        locale,
        title: draft[locale].title.trim(),
        subtitle: draft[locale].subtitle.trim() || null,
        image_url: draft[locale].imageUrl,
      })),
    }
  }
}
