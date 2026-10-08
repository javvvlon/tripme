import type { IContentItem } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ContentCardShape = 'square' | 'wide' | 'fill'

export interface IContentCardProps {
  item: IContentItem
  compact?: boolean
  shape?: ContentCardShape
  eager?: boolean
}
