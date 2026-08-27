import type { IContentItem } from '~/modules/content/models/HomeContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ContentCardShape = 'square' | 'wide' | 'fill'

export interface IContentCardProps {
  item: IContentItem
  compact?: boolean
  /**
   * How the card gets its height:
   *   square — holds a 1:1 box, for a row where every card is the same width
   *   wide   — a landscape banner that sets the row's height
   *   fill   — takes whatever height the row already has
   */
  shape?: ContentCardShape
  /** first card of the first section: its image is the LCP candidate */
  eager?: boolean
}
