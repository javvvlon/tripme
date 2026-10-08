import { Model } from '~/shared/helpers/model'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { BLOCKS, defaultSettings, isSectionKind } from '~/modules/content/contracts/blocks'
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
    const blank = () => Object.fromEntries(CONTENT_LOCALES.map(locale => [locale, ''])) as Record<ContentLocale, string>
    const titles = blank()
    const subtitles = blank()
    const eyebrows = blank()
    const bodies = blank()
    const ctaLabels = blank()

    for (const translation of raw.translations ?? []) {
      if (!CONTENT_LOCALES.includes(translation.locale)) continue

      titles[translation.locale] = translation.title ?? ''
      subtitles[translation.locale] = translation.subtitle ?? ''
      eyebrows[translation.locale] = translation.eyebrow ?? ''
      bodies[translation.locale] = translation.body ?? ''
      ctaLabels[translation.locale] = translation.cta_label ?? ''
    }

    const kind = isSectionKind(raw.kind) ? raw.kind : 'cards'
    const defaults = defaultSettings(kind)

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
      eyebrows,
      bodies,
      ctaLabels,
      settings: {
        imageUrl: raw.settings?.image_url ?? '',
        pageSize: raw.settings?.page_size ?? defaults.pageSize,
        excludeFeatured: raw.settings?.exclude_featured !== false,
        style: raw.settings?.style ?? defaults.style,
        tone: raw.settings?.tone ?? defaults.tone,
        imageSide: raw.settings?.image_side ?? defaults.imageSide,
        listSize: raw.settings?.list_size ?? defaults.listSize,
      },
    }
  }
}
