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

export const SECTION_KINDS = ['hero', 'featured', 'cards', 'features', 'faq', 'feed', 'banner', 'media', 'cta', 'quote', 'text', 'spotlight', 'search', 'contact'] as const

export type SectionKind = typeof SECTION_KINDS[number]

export const SECTION_SOURCES = ['list', 'posts', 'none'] as const

export type SectionSource = typeof SECTION_SOURCES[number]

export const FEED_PAGE_SIZES = [6, 9, 12, 18, 24] as const

export const SPOTLIGHT_SIZES = [3, 4, 5, 6] as const

export const BANNER_STYLES = ['card', 'wide'] as const

export type BannerStyle = typeof BANNER_STYLES[number]

export const BLOCK_TONES = ['light', 'brand', 'dark'] as const

export type BlockTone = typeof BLOCK_TONES[number]

export const IMAGE_SIDES = ['left', 'right'] as const

export type ImageSide = typeof IMAGE_SIDES[number]

export type BlockOption = 'style' | 'tone' | 'imageSide' | 'listSize'

export type BlockField = 'title' | 'subtitle' | 'body' | 'image'

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
  bodyRequired: boolean
  subtitle: boolean
  image: boolean
  pickPost: boolean
  feed: boolean
  eyebrow: boolean
  body: false | 'rich' | 'plain'
  cta: boolean
  options: BlockOption[]
  labels: Partial<Record<BlockField, string>>
  title: boolean
  alwaysShown: boolean
  item: IItemFields
}

const NO_ITEMS: IItemFields = { image: false, description: false, link: false, badge: false }

const PLAIN = {
  subtitle: false,
  image: false,
  pickPost: false,
  feed: false,
  eyebrow: false,
  body: false as const,
  cta: false,
  bodyRequired: false,
  options: [] as BlockOption[],
  labels: {},
  title: true,
  alwaysShown: false,
}

const STANDALONE = {
  ...PLAIN,
  pages: ['home', 'blog'] as ContentPage[],
  sources: ['none'] as SectionSource[],
  layout: false,
  item: NO_ITEMS,
}

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
  banner: {
    ...STANDALONE,
    kind: 'banner',
    icon: 'megaphone',
    link: true,
    titleRequired: true,
    eyebrow: true,
    subtitle: true,
    image: true,
    cta: true,
    options: ['style', 'tone'],
    labels: { image: 'picture' },
  },
  media: {
    ...STANDALONE,
    kind: 'media',
    icon: 'columns',
    link: true,
    titleRequired: true,
    image: true,
    body: 'rich',
    cta: true,
    options: ['imageSide'],
    labels: { image: 'picture' },
  },
  cta: {
    ...STANDALONE,
    kind: 'cta',
    icon: 'cursor',
    link: true,
    titleRequired: true,
    subtitle: true,
    cta: true,
    options: ['tone'],
  },
  quote: {
    ...STANDALONE,
    kind: 'quote',
    icon: 'quote',
    link: false,
    titleRequired: false,
    bodyRequired: true,
    body: 'plain',
    subtitle: true,
    image: true,
    labels: { title: 'author', subtitle: 'role', body: 'quote', image: 'photo' },
  },
  text: {
    ...STANDALONE,
    kind: 'text',
    icon: 'doc',
    link: false,
    titleRequired: false,
    bodyRequired: true,
    body: 'rich',
  },
  spotlight: {
    ...PLAIN,
    kind: 'spotlight',
    icon: 'layers',
    pages: ['home', 'blog'],
    sources: ['posts'],
    layout: false,
    link: true,
    titleRequired: false,
    options: ['listSize'],
    item: NO_ITEMS,
  },
  search: {
    ...STANDALONE,
    kind: 'search',
    icon: 'search',
    pages: ['home'],
    link: false,
    titleRequired: false,
    subtitle: true,
    image: true,
    alwaysShown: true,
  },
  contact: {
    ...STANDALONE,
    kind: 'contact',
    icon: 'phone',
    link: false,
    titleRequired: false,
    title: false,
    alwaysShown: true,
  },
}

export const SINGLE_KINDS: SectionKind[] = ['search', 'contact']

export const defaultSettings = (kind?: SectionKind): ISectionSettings => ({
  imageUrl: '',
  pageSize: 9,
  excludeFeatured: true,
  style: 'card',
  tone: kind === 'cta' ? 'brand' : 'light',
  imageSide: 'left',
  listSize: 4,
})

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
  style?: BannerStyle
  tone?: BlockTone
  image_side?: ImageSide
  list_size?: number
}

export interface ISectionTranslationRaw {
  locale: ContentLocale
  title: string
  subtitle?: string | null
  eyebrow?: string | null
  body?: string | null
  cta_label?: string | null
}

export interface IContentSectionRaw {
  uuid: string
  kind: SectionKind
  source: SectionSource
  settings?: ISectionSettingsRaw
  translations: ISectionTranslationRaw[]
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
  style: BannerStyle
  tone: BlockTone
  imageSide: ImageSide
  listSize: number
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
  eyebrows: Record<ContentLocale, string>
  bodies: Record<ContentLocale, string>
  ctaLabels: Record<ContentLocale, string>
  settings: ISectionSettings
}

export interface IPageMetaDraft {
  seo: Record<ContentLocale, { title: string, description: string }>
}
