import type { ContentLocale } from '~/modules/content/contracts/content'
import type { BadgeType } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPostTranslationRaw {
  locale: ContentLocale
  title: string
  excerpt: string
  body: string
  badge_label: string | null
}

export interface IPostAuthorRaw {
  uuid: string
  first_name: string
  last_name: string
}

export interface IPostRaw {
  uuid: string
  slug: string
  image_url: string | null
  badge_type: BadgeType | null
  link: string | null
  published_at: string | null
  author: IPostAuthorRaw | null
  translations: IPostTranslationRaw[]
}

export interface IPostAdminRaw extends IPostRaw {
  is_published: boolean
  updated_at: string
}

export interface IPostTranslationDraft {
  title: string
  excerpt: string
  body: string
  badgeLabel: string
}

export interface IPostDraft {
  slug: string
  imageUrl: string | null
  badgeType: BadgeType | null
  link: string
  isPublished: boolean
  translations: Record<ContentLocale, IPostTranslationDraft>
}
