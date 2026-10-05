import { Model } from '~/shared/helpers/model'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { isSectionKind } from '~/modules/content/contracts/blocks'
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

    for (const translation of raw.translations ?? []) {
      if (CONTENT_LOCALES.includes(translation.locale)) titles[translation.locale] = translation.title
    }

    return {
      uuid: raw.uuid,
      kind: isSectionKind(raw.kind) ? raw.kind : 'cards',
      source: raw.source === 'posts' ? 'posts' : 'list',
      link: raw.link ?? '',
      anchor: raw.anchor ?? '',
      postIds: [...(raw.post_ids ?? [])],
      listId: raw.list_id ?? '',
      layoutId: raw.layout_id ?? '',
      isPublished: raw.is_published,
      titles,
    }
  }
}
