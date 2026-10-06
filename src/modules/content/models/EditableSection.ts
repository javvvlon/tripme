import { Model } from '~/shared/helpers/model'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { BLOCKS, isSectionKind } from '~/modules/content/contracts/blocks'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { IEditableSectionRaw, ISectionDraft } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IEditableSection extends ISectionDraft {
  uuid: string
}

export class EditableSection extends Model<IEditableSection> {
  protected static override mapRaw(raw: IEditableSectionRaw): IEditableSection {
    const titles = Object.fromEntries(CONTENT_LOCALES.map(locale => [locale, ''])) as Record<ContentLocale, string>
    const subtitles = Object.fromEntries(CONTENT_LOCALES.map(locale => [locale, ''])) as Record<ContentLocale, string>

    for (const translation of raw.translations ?? []) {
      if (!CONTENT_LOCALES.includes(translation.locale)) continue

      titles[translation.locale] = translation.title ?? ''
      subtitles[translation.locale] = translation.subtitle ?? ''
    }

    const kind = isSectionKind(raw.kind) ? raw.kind : 'cards'

    return {
      uuid: raw.uuid,
      kind,
      source: BLOCKS[kind].sources.includes(raw.source) ? raw.source : BLOCKS[kind].sources[0]!,
      link: raw.link ?? '',
      anchor: raw.anchor ?? '',
      postIds: [...(raw.post_ids ?? [])],
      listId: raw.list_id ?? '',
      layoutId: raw.layout_id ?? '',
      isPublished: raw.is_published,
      titles,
      subtitles,
      settings: {
        imageUrl: raw.settings?.image_url ?? '',
        pageSize: raw.settings?.page_size ?? 9,
        excludeFeatured: raw.settings?.exclude_featured !== false,
      },
    }
  }
}
