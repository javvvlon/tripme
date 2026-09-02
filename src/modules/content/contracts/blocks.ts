import type { ContentLocale } from './content'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const BADGE_TYPES = ['primary', 'secondary', 'sale'] as const

export const SECTION_VARIANTS = ['list', 'posts'] as const

export type SectionVariant = typeof SECTION_VARIANTS[number]

export type BadgeType = typeof BADGE_TYPES[number]

export interface IContentTranslationRaw {
  locale: ContentLocale
  title: string
  description: string | null
  badge_label: string | null
}

export interface IContentItemRaw {
  uuid: string
  translations: IContentTranslationRaw[]
  image_url: string | null
  badge_type: BadgeType | null
  link: string | null
  position: number
}

export interface IContentListRaw {
  uuid: string
  name: string
  items: IContentItemRaw[]
}

export interface IContentLayoutRaw {
  uuid: string
  grid: string
  name: string | null
}

export interface IContentSectionRaw {
  uuid: string
  translations: Array<{ locale: ContentLocale, title: string }>
  link: string | null
  variant: SectionVariant
  post_ids: string[]
  list_id: string | null
  layout_id: string
  position: number
}

export interface IBannerRaw {
  translations: Array<{
    locale: ContentLocale
    title: string
    subtitle: string | null
    image_url: string | null
  }>
}

export interface IHomeContentRaw {
  banner: IBannerRaw | null
  sections: IContentSectionRaw[]
  layouts: IContentLayoutRaw[]
  lists: IContentListRaw[]
  posts: IPostRaw[]
}

export interface IStoredFileRaw {
  url: string
  path: string
  title: string
  size: number
  uploaded_at: string | null
}

export interface IListSummaryRaw {
  uuid: string
  name: string
  items_count: number
  updated_at: string
}

export interface IEditableSectionRaw extends IContentSectionRaw {
  is_published: boolean
}
