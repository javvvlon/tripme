import type { IGrid } from '~/shared/helpers/grid'
import type { IContentItem } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ICardGridProps {
  items: IContentItem[]
  grid: IGrid | null
  eager?: boolean
}
