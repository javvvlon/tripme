import type { ContentLocale } from './content'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const BADGE_TYPES = ['primary', 'secondary', 'sale'] as const

export type BadgeType = typeof BADGE_TYPES[number]

export const SECTION_KINDS = ['cards', 'features', 'faq'] as const

export type SectionKind = typeof SECTION_KINDS[number]

export const SECTION_SOURCES = ['list', 'posts'] as const

export type SectionSource = typeof SECTION_SOURCES[number]

export interface IItemFields {
  image: boolean
  description: boolean
  link: boolean
  badge: boolean
}

export interface IBlock {
  kind: SectionKind
  icon: string
  sources: readonly SectionSource[]
  layout: boolean
  link: boolean
  item: IItemFields
}

export const BLOCKS: Record<SectionKind, IBlock> = {
  cards: {
    kind: 'cards',
    icon: 'grid',
    sources: ['list', 'posts'],
    layout: true,
    link: true,
    item: { image: true, description: true, link: true, badge: true },
  },
  features: {
    kind: 'features',
    icon: 'star',
    sources: ['list'],
    layout: false,
    link: false,
    item: { image: true, description: true, link: false, badge: false },
  },
  faq: {
    kind: 'faq',
    icon: 'help',
    sources: ['list'],
    layout: false,
    link: false,
    item: { image: false, description: true, link: false, badge: false },
  },
}

export const isSectionKind = (value: unknown): value is SectionKind =>
  SECTION_KINDS.includes(value as SectionKind)

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
  kind: SectionKind
  items: IContentItemRaw[]
}

export interface IContentLayoutRaw {
  uuid: string
  grid: string
  name: string | null
}

export interface IContentSectionRaw {
  uuid: string
  kind: SectionKind
  source: SectionSource
  translations: Array<{ locale: ContentLocale, title: string }>
  link: string | null
  anchor: string | null
  post_ids: string[]
  list_id: string | null
  layout_id: string | null
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
  folder_id: string | null
  size: number
  uploaded_at: string | null
}

export interface IMediaFolderRaw {
  id: string
  name: string
  count: number
}

export interface IListSummaryRaw {
  uuid: string
  name: string
  kind: SectionKind
  items_count: number
  updated_at: string
}

export interface IEditableSectionRaw extends IContentSectionRaw {
  is_published: boolean
}

export interface ISectionDraft {
  kind: SectionKind
  source: SectionSource
  link: string
  anchor: string
  postIds: string[]
  listId: string
  layoutId: string
  isPublished: boolean
  titles: Record<ContentLocale, string>
}
