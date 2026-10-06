import { Model } from '~/shared/helpers/model'
import { parseGrid } from '~/shared/helpers/grid'
import type { IGrid } from '~/shared/helpers/grid'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { BLOCKS, isSectionKind } from '~/modules/content/contracts/blocks'
import type {
  BadgeType,
  BannerStyle,
  BlockTone,
  ImageSide,
  ContentPage,
  IContentItemRaw,
  IContentSectionRaw,
  IPageContentRaw,
  ISectionTranslationRaw,
  SectionKind,
} from '~/modules/content/contracts/blocks'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IContentItem {
  uuid: string
  href: string | null
  title: string
  description: string | null
  imageUrl: string | null
  link: string | null
  badge: { label: string, type: BadgeType } | null
  author: string | null
  publishedAt: string | null
}

export interface IContentSection {
  uuid: string
  title: string
  subtitle: string | null
  eyebrow: string | null
  body: string | null
  ctaLabel: string | null
  style: BannerStyle
  tone: BlockTone
  imageSide: ImageSide
  imageUrl: string | null
  pageSize: number
  link: string | null
  anchor: string | null
  kind: SectionKind
  grid: IGrid | null
  items: IContentItem[]
}

export interface IHomeBanner {
  title: string
  subtitle: string | null
  imageUrl: string | null
}

export interface IPageSeo {
  title: string
  description: string
}

export interface IPageContent {
  page: ContentPage
  banner: IHomeBanner | null
  seo: IPageSeo | null
  sections: IContentSection[]
}

const DEFAULT_PAGE_SIZE = 9

const DEFAULT_SPOTLIGHT = 4

const ruleOf = (section: IContentSectionRaw) => BLOCKS[isSectionKind(section.kind) ? section.kind : 'cards']

const isVisible = (kind: SectionKind, translation: ISectionTranslationRaw | null, items: number): boolean => {
  const rule = BLOCKS[kind]

  if (rule.bodyRequired) return Boolean(translation?.body?.trim())

  if (rule.sources.includes('none')) return Boolean(translation?.title?.trim())

  return items > 0
}

export class PageContent extends Model<IPageContent> {
  public static forLocale(raw: IPageContentRaw, locale: ContentLocale): PageContent {
    const postItems = new Map(
      (raw?.posts ?? [])
        .map(post => [post.uuid, postAsItem(post, locale)] as const)
        .filter((entry): entry is [string, IContentItem] => entry[1] !== null),
    )

    const latest = [...postItems.values()]

    const lists = new Map((raw?.lists ?? []).map(list => [list.uuid, list]))
    const layouts = new Map((raw?.layouts ?? []).map(layout => [layout.uuid, layout]))

    const ordered = [...(raw?.sections ?? [])].sort((a, b) => a.position - b.position)

    const featuredId = (() => {
      const featured = ordered.find(section => section.kind === 'featured')

      if (!featured) return null

      return (featured.post_ids?.[0] && postItems.has(featured.post_ids[0]) ? featured.post_ids[0] : latest[0]?.uuid) ?? null
    })()

    const itemsOf = (section: IContentSectionRaw, capacity: number | undefined): IContentItem[] => {
      if (section.kind === 'hero') return []

      if (section.kind === 'featured') {
        const item = featuredId ? postItems.get(featuredId) : null

        return item ? [item] : []
      }

      if (section.kind === 'feed') {
        return section.settings?.exclude_featured === false
          ? latest
          : latest.filter(item => item.uuid !== featuredId)
      }

      if (section.kind === 'spotlight') {
        const picked = section.post_ids?.length
          ? section.post_ids.map(id => postItems.get(id)).filter((item): item is IContentItem => Boolean(item))
          : latest

        return picked.slice(0, 1 + (section.settings?.list_size ?? DEFAULT_SPOTLIGHT))
      }

      if (ruleOf(section).sources.includes('none')) return []

      if (section.source === 'posts') {
        return (section.post_ids?.length
          ? section.post_ids
              .map(id => postItems.get(id))
              .filter((item): item is IContentItem => Boolean(item))
          : latest
        ).slice(0, capacity)
      }

      const list = lists.get(section.list_id ?? '')

      if (!list) return []

      return list.items
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(item => mapItem(item, locale))
        .filter((item): item is IContentItem => item !== null)
        .slice(0, capacity)
    }

    const sections = ordered
      .map((section) => {
        if (!isSectionKind(section.kind)) return null

        const block = BLOCKS[section.kind]
        const grid = block.layout ? parseGrid(layouts.get(section.layout_id ?? '')?.grid) : null

        if (block.layout && !grid) return null

        const translation = pick(section.translations, locale)
        const items = itemsOf(section, grid?.capacity)

        if (!isVisible(section.kind, translation, items.length)) return null

        return {
          uuid: section.uuid,
          title: translation?.title ?? '',
          subtitle: translation?.subtitle?.trim() || null,
          eyebrow: translation?.eyebrow?.trim() || null,
          body: translation?.body?.trim() || null,
          ctaLabel: translation?.cta_label?.trim() || null,
          style: section.settings?.style ?? 'card',
          tone: section.settings?.tone ?? (section.kind === 'cta' ? 'brand' : 'light'),
          imageSide: section.settings?.image_side ?? 'left',
          imageUrl: section.settings?.image_url ?? null,
          pageSize: section.settings?.page_size ?? DEFAULT_PAGE_SIZE,
          link: block.link ? section.link : null,
          anchor: section.anchor,
          kind: section.kind,
          grid,
          items,
        } satisfies IContentSection
      })
      .filter((section): section is IContentSection => section !== null)

    const translation = pick(raw?.banner?.translations, locale)

    const imageUrl = translation?.image_url
      ?? raw?.banner?.translations.find(t => t.image_url)?.image_url
      ?? null

    const banner = translation?.title?.trim()
      ? {
          title: translation.title,
          subtitle: translation.subtitle?.trim() || null,
          imageUrl,
        }
      : null

    const seo = raw?.seo?.[locale]

    return new PageContent({
      page: raw?.page ?? 'home',
      banner,
      seo: seo?.title?.trim() ? { title: seo.title, description: seo.description ?? '' } : null,
      sections,
    })
  }

  public isEmpty(): boolean {
    return this.get('sections').length === 0 && this.get('banner') === null
  }
}

function pick<T extends { locale: ContentLocale }>(
  translations: T[] | undefined,
  locale: ContentLocale,
): T | null {
  return translations?.find(translation => translation.locale === locale) ?? null
}

function mapItem(raw: IContentItemRaw, locale: ContentLocale): IContentItem | null {
  const translation = pick(raw.translations, locale)

  if (!translation?.title) return null

  const label = translation.badge_label?.trim()

  return {
    uuid: raw.uuid,
    href: raw.link,
    title: translation.title,
    description: translation.description,
    imageUrl: raw.image_url,
    link: raw.link,
    badge: label && raw.badge_type ? { label, type: raw.badge_type } : null,
    author: null,
    publishedAt: null,
  }
}

function postAsItem(raw: IPostRaw, locale: ContentLocale): IContentItem | null {
  const translation = raw.translations.find(item => item.locale === locale)

  if (!translation?.title) return null

  const label = translation.badge_label?.trim()

  return {
    uuid: raw.uuid,
    href: `/blog/${raw.slug}`,
    title: translation.title,
    description: translation.excerpt || null,
    imageUrl: raw.image_url,
    link: raw.link,
    badge: label && raw.badge_type ? { label, type: raw.badge_type } : null,
    author: [raw.author?.first_name, raw.author?.last_name].filter(Boolean).join(' ') || null,
    publishedAt: raw.published_at,
  }
}

export type { IContentSectionRaw }
