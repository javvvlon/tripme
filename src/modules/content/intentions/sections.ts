import { BLOCKS } from '~/modules/content/contracts/blocks'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type {
  IContentLayoutRaw,
  IContentListRaw,
  IHomeContentRaw,
  ISectionDraft,
} from '~/modules/content/contracts/blocks'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class SectionsIntention {
  public toRequest(sections: ISectionDraft[]): Record<string, unknown> {
    return {
      items: sections.map((section) => {
        const block = BLOCKS[section.kind]
        const fromPosts = section.source === 'posts'

        return {
          kind: section.kind,
          source: section.source,
          link: block.link ? section.link.trim() || null : null,
          anchor: section.anchor.trim() || null,
          post_ids: fromPosts ? section.postIds : [],
          list_id: fromPosts ? null : section.listId,
          layout_id: block.layout ? section.layoutId : null,
          is_published: section.isPublished,
          translations: CONTENT_LOCALES.map(locale => ({ locale, title: section.titles[locale] })),
        }
      }),
    }
  }

  public toPreview(
    sections: Array<ISectionDraft & { key: string }>,
    layouts: IContentLayoutRaw[],
    lists: IContentListRaw[],
    posts: IPostRaw[],
  ): IHomeContentRaw {
    return {
      banner: null,
      layouts,
      lists,
      posts,
      sections: sections.map((section, index) => ({
        uuid: section.key,
        kind: section.kind,
        source: section.source,
        link: section.link.trim() || null,
        anchor: section.anchor.trim() || null,
        post_ids: section.postIds,
        list_id: section.listId || null,
        layout_id: section.layoutId || null,
        position: index,
        translations: CONTENT_LOCALES.map(locale => ({ locale, title: section.titles[locale] })),
      })),
    }
  }
}
