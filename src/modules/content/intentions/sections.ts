import { BLOCKS } from '~/modules/content/contracts/blocks'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type {
  ContentPage,
  IContentLayoutRaw,
  IContentListRaw,
  IContentSectionRaw,
  IPageContentRaw,
  IPageMetaDraft,
  ISectionDraft,
  ISectionSettingsRaw,
} from '~/modules/content/contracts/blocks'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class SectionsIntention {
  public toRequest(sections: ISectionDraft[]): Record<string, unknown> {
    return { items: sections.map(section => this.section(section)) }
  }

  public metaRequest(meta: IPageMetaDraft): Record<string, unknown> {
    return {
      seo: Object.fromEntries(CONTENT_LOCALES.map(locale => [locale, {
        title: meta.seo[locale].title.trim(),
        description: meta.seo[locale].description.trim(),
      }])),
    }
  }

  public toPreview(
    page: ContentPage,
    sections: Array<ISectionDraft & { key: string }>,
    layouts: IContentLayoutRaw[],
    lists: IContentListRaw[],
    posts: IPostRaw[],
  ): IPageContentRaw {
    return {
      page,
      banner: null,
      layouts,
      lists,
      posts,
      sections: sections.map((section, index) => ({
        ...this.section(section),
        uuid: section.key,
        position: index,
      }) as IContentSectionRaw),
    }
  }

  private section(section: ISectionDraft) {
    const block = BLOCKS[section.kind]
    const fromPosts = section.source === 'posts'

    return {
      kind: section.kind,
      source: section.source,
      link: block.link ? section.link.trim() || null : null,
      anchor: section.anchor.trim() || null,
      post_ids: fromPosts && !block.feed ? section.postIds : [],
      list_id: section.source === 'list' ? section.listId : null,
      layout_id: block.layout ? section.layoutId : null,
      is_published: section.isPublished,
      settings: this.settings(section),
      translations: CONTENT_LOCALES.map(locale => ({
        locale,
        title: section.titles[locale],
        subtitle: block.subtitle ? section.subtitles[locale] : null,
      })),
    }
  }

  private settings(section: ISectionDraft): ISectionSettingsRaw {
    const block = BLOCKS[section.kind]

    if (block.image) return { image_url: section.settings.imageUrl.trim() || null }

    if (block.feed) return { page_size: section.settings.pageSize, exclude_featured: section.settings.excludeFeatured }

    return {}
  }
}
