import type { IContentItem } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPostFeedProps {
  items: IContentItem[]
  pageSize: number
}
