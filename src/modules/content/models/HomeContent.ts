import { Model } from '~/shared/helpers/model'
import { parseGrid } from '~/shared/helpers/grid'
import type { IGrid } from '~/shared/helpers/grid'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type {
  BadgeType,
  IContentItemRaw,
  IContentSectionRaw,
  IHomeContentRaw,
} from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IContentItem {
  uuid: string
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
  grid: IGrid
  items: IContentItem[]
}

export interface IHomeBanner {
  title: string
  subtitle: string | null
  imageUrl: string | null
}

export interface IHomeContent {
  /** null until an editor publishes one; the design's own hero stands in */
  banner: IHomeBanner | null
  sections: IContentSection[]
}

export class HomeContent extends Model<IHomeContent> {
  public static forLocale(raw: IHomeContentRaw, locale: ContentLocale): HomeContent {
    const lists = new Map((raw?.lists ?? []).map(list => [list.uuid, list]))
    const layouts = new Map((raw?.layouts ?? []).map(layout => [layout.uuid, layout]))

    const sections = [...(raw?.sections ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((section) => {
        const list = lists.get(section.list_id)
        const grid = parseGrid(layouts.get(section.layout_id)?.grid)

        if (!list || !grid) return null

        const items = [...list.items]
          .sort((a, b) => a.position - b.position)
          .map(item => mapItem(item, locale))
          .filter((item): item is IContentItem => item !== null)
          .slice(0, grid.capacity)

        if (!items.length) return null

        return {
          uuid: section.uuid,
          title: pick(section.translations, locale)?.title ?? '',
          link: section.link,
          grid,
          items,
        } satisfies IContentSection
      })
      .filter((section): section is IContentSection => section !== null)

    const translation = pick(raw?.banner?.translations, locale)

    /**
     * A banner with no title in this language is not published in it — the
     * built-in hero copy stands in rather than a blank headline.
     */
    /**
     * The image falls back to whichever language has one.
     *
     * It is stored per language so that artwork with the headline baked into
     * it can differ — but most banners are one photograph, and making an
     * editor upload it three times to avoid a placeholder on two thirds of the
     * site is not a choice, it is a chore. Upload once; override per language
     * only when it actually differs.
     */
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
    title: translation.title,
    description: translation.description,
    imageUrl: raw.image_url,
    link: raw.link,
    badge: label && raw.badge_type ? { label, type: raw.badge_type } : null,
  }
}

export type { IContentSectionRaw }
