import type { SearchMode } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type SearchWidgetVariant = 'hero' | 'bar'

export interface ISearchWidgetProps {
  variant?: SearchWidgetVariant
  mode?: SearchMode
}
