import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { IPostDraft } from '../contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class PostIntention {
  toRequest(draft: IPostDraft) {
    return {
      slug: draft.slug.trim(),
      image_url: draft.imageUrl,
      badge_type: draft.badgeType,
      link: draft.link.trim() || null,
      is_published: draft.isPublished,
      tour: draft.tour,
      translations: CONTENT_LOCALES.map(locale => ({
        locale,
        title: draft.translations[locale].title.trim(),
        excerpt: draft.translations[locale].excerpt.trim(),
        body: draft.translations[locale].body,
        badge_label: draft.translations[locale].badgeLabel.trim() || null,
      })),
    }
  }
}

export class PostCreateIntention {
  toRequest(draft: { title: string, slug: string, locale: string }) {
    return {
      title: draft.title.trim(),
      slug: draft.slug.trim(),
      locale: draft.locale,
    }
  }
}
