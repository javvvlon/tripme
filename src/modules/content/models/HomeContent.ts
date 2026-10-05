import { Model } from '~/shared/helpers/model'
import { parseGrid } from '~/shared/helpers/grid'
import type { IGrid } from '~/shared/helpers/grid'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { BLOCKS, isSectionKind } from '~/modules/content/contracts/blocks'
import type {
  BadgeType,
  IContentItemRaw,
  IContentSectionRaw,
  IHomeContentRaw,
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
}

export interface IContentSection {
  uuid: string
  title: string
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

export interface IHomeContent {
  banner: IHomeBanner | null
  sections: IContentSection[]
}

export class HomeContent extends Model<IHomeContent> {
  public static forLocale(raw: IHomeContentRaw, locale: ContentLocale): HomeContent {
    const postItems = new Map(
      (raw?.posts ?? [])
        .map(post => [post.uuid, postAsItem(post, locale)] as const)
        .filter((entry): entry is [string, IContentItem] => entry[1] !== null),
    )

    const latest = [...postItems.values()]

    const lists = new Map((raw?.lists ?? []).map(list => [list.uuid, list]))
    const layouts = new Map((raw?.layouts ?? []).map(layout => [layout.uuid, layout]))

    const sections = [...(raw?.sections ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((section) => {
        if (!isSectionKind(section.kind)) return null

        const block = BLOCKS[section.kind]
        const grid = block.layout ? parseGrid(layouts.get(section.layout_id ?? '')?.grid) : null

        if (block.layout && !grid) return null

        const fromPosts = section.source === 'posts'
        const list = fromPosts ? null : lists.get(section.list_id ?? '')

        if (!fromPosts && !list) return null

        const items = (fromPosts
          ? (section.post_ids?.length
              ? section.post_ids
                  .map(id => postItems.get(id))
                  .filter((item): item is IContentItem => Boolean(item))
              : latest)
          : list!.items
              .slice()
              .sort((a, b) => a.position - b.position)
              .map(item => mapItem(item, locale))
              .filter((item): item is IContentItem => item !== null)
        ).slice(0, grid?.capacity)

        if (!items.length) return null

        return {
          uuid: section.uuid,
          title: pick(section.translations, locale)?.title ?? '',
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

    return new HomeContent({ banner, sections })
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
  }
}

export type { IContentSectionRaw }
