import type { ContentLocale } from './content'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export const BADGE_TYPES = ['primary', 'secondary', 'sale'] as const

export type BadgeType = typeof BADGE_TYPES[number]

export const PAGES = ['home', 'blog'] as const

export type ContentPage = typeof PAGES[number]

export const LIST_KINDS = ['cards', 'features', 'faq'] as const

export type ListKind = typeof LIST_KINDS[number]

export const SECTION_KINDS = ['hero', 'featured', 'cards', 'features', 'faq', 'feed'] as const

export type SectionKind = typeof SECTION_KINDS[number]

export const SECTION_SOURCES = ['list', 'posts', 'none'] as const

export type SectionSource = typeof SECTION_SOURCES[number]

export const FEED_PAGE_SIZES = [6, 9, 12, 18, 24] as const

export interface IItemFields {
  image: boolean
  description: boolean
  link: boolean
  badge: boolean
}

export interface IBlock {
  kind: SectionKind
  icon: string
  pages: readonly ContentPage[]
  sources: readonly SectionSource[]
  layout: boolean
  link: boolean
  titleRequired: boolean
  subtitle: boolean
  image: boolean
  pickPost: boolean
  feed: boolean
  item: IItemFields
}

const NO_ITEMS: IItemFields = { image: false, description: false, link: false, badge: false }

const PLAIN = { subtitle: false, image: false, pickPost: false, feed: false }

export const BLOCKS: Record<SectionKind, IBlock> = {
  hero: {
    ...PLAIN,
    kind: 'hero',
    icon: 'image',
    pages: ['blog'],
    sources: ['none'],
    layout: false,
    link: false,
    titleRequired: true,
    subtitle: true,
    image: true,
    item: NO_ITEMS,
  },
  featured: {
    ...PLAIN,
    kind: 'featured',
    icon: 'trophy',
    pages: ['blog'],
    sources: ['posts'],
    layout: false,
    link: false,
    titleRequired: false,
    pickPost: true,
    item: NO_ITEMS,
  },
  cards: {
    ...PLAIN,
    kind: 'cards',
    icon: 'grid',
    pages: ['home', 'blog'],
    sources: ['list', 'posts'],
    layout: true,
    link: true,
    titleRequired: true,
    item: { image: true, description: true, link: true, badge: true },
  },
  features: {
    ...PLAIN,
    kind: 'features',
    icon: 'star',
    pages: ['home', 'blog'],
    sources: ['list'],
    layout: false,
    link: false,
    titleRequired: true,
    item: { image: true, description: true, link: false, badge: false },
  },
  faq: {
    ...PLAIN,
    kind: 'faq',
    icon: 'help',
    pages: ['home', 'blog'],
    sources: ['list'],
    layout: false,
    link: false,
    titleRequired: true,
    item: { image: false, description: true, link: false, badge: false },
  },
  feed: {
    ...PLAIN,
    kind: 'feed',
    icon: 'list',
    pages: ['blog'],
    sources: ['posts'],
    layout: false,
    link: false,
    titleRequired: false,
    feed: true,
    item: NO_ITEMS,
  },
}

export const kindsFor = (page: ContentPage): SectionKind[] =>
  SECTION_KINDS.filter(kind => BLOCKS[kind].pages.includes(page))

export const isSectionKind = (value: unknown): value is SectionKind =>
  SECTION_KINDS.includes(value as SectionKind)

export const isListKind = (value: unknown): value is ListKind =>
  LIST_KINDS.includes(value as ListKind)

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
  kind: ListKind
  items: IContentItemRaw[]
}

export interface IContentLayoutRaw {
  uuid: string
  grid: string
  name: string | null
}

export interface ISectionSettingsRaw {
  image_url?: string | null
  page_size?: number
  exclude_featured?: boolean
}

export interface IContentSectionRaw {
  uuid: string
  kind: SectionKind
  source: SectionSource
  settings?: ISectionSettingsRaw
  translations: Array<{ locale: ContentLocale, title: string, subtitle?: string | null }>
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

export type PageSeoRaw = Partial<Record<ContentLocale, { title?: string, description?: string }>>

export interface IPageContentRaw {
  page?: ContentPage
  seo?: PageSeoRaw
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
  kind: ListKind
  items_count: number
  updated_at: string
}

export interface IEditableSectionRaw extends IContentSectionRaw {
  is_published: boolean
}

export interface ISectionSettings {
  imageUrl: string
  pageSize: number
  excludeFeatured: boolean
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
  subtitles: Record<ContentLocale, string>
  settings: ISectionSettings
}

export interface IPageMetaDraft {
  seo: Record<ContentLocale, { title: string, description: string }>
}
