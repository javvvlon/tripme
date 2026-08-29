import { Model } from '~/shared/helpers/model'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { BadgeType } from '~/modules/content/contracts/blocks'
import type { IPostAdminRaw, IPostDraft, IPostRaw, IPostTranslationDraft } from '../contracts/posts'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPostAttributes {
  uuid: string
  slug: string
  title: string
  excerpt: string
  body: string
  imageUrl: string | null
  link: string | null
  badge: { label: string, type: BadgeType } | null
  tour: ILeadTrip | null
  author: string | null
  publishedAt: string | null
}

const authorName = (raw: IPostRaw): string | null => {
  if (!raw.author) return null

  const name = `${raw.author.first_name} ${raw.author.last_name}`.trim()

  return name || null
}

const emptyTranslation = (): IPostTranslationDraft => ({
  title: '',
  excerpt: '',
  body: '',
  badgeLabel: '',
})

export class Post extends Model<IPostAttributes> {
  static forLocale(raw: IPostRaw, locale: ContentLocale): Post | null {
    const translation = raw.translations.find(item => item.locale === locale)

    if (!translation?.title) return null

    const label = translation.badge_label?.trim()

    return new Post({
      uuid: raw.uuid,
      slug: raw.slug,
      title: translation.title,
      excerpt: translation.excerpt,
      body: translation.body,
      imageUrl: raw.image_url,
      link: raw.link,
      badge: label && raw.badge_type ? { label, type: raw.badge_type } : null,
      tour: raw.tour ?? null,
      author: authorName(raw),
      publishedAt: raw.published_at,
    })
  }

  static listForLocale(raw: IPostRaw[], locale: ContentLocale): Post[] {
    return raw
      .map(item => Post.forLocale(item, locale))
      .filter((item): item is Post => item !== null)
  }

  static toDraft(raw: IPostAdminRaw): IPostDraft {
    const translations = {} as Record<ContentLocale, IPostTranslationDraft>

    for (const locale of CONTENT_LOCALES) {
      const found = raw.translations.find(item => item.locale === locale)

      translations[locale] = found
        ? {
            title: found.title ?? '',
            excerpt: found.excerpt ?? '',
            body: found.body ?? '',
            badgeLabel: found.badge_label ?? '',
          }
        : emptyTranslation()
    }

    return {
      tour: raw.tour ?? null,
      slug: raw.slug,
      imageUrl: raw.image_url,
      badgeType: raw.badge_type,
      link: raw.link ?? '',
      isPublished: raw.is_published,
      translations,
    }
  }

  static emptyDraft(): IPostDraft {
    const translations = {} as Record<ContentLocale, IPostTranslationDraft>

    for (const locale of CONTENT_LOCALES) translations[locale] = emptyTranslation()

    return {
      tour: null,
      slug: '',
      imageUrl: null,
      badgeType: null,
      link: '',
      isPublished: false,
      translations,
    }
  }
}
