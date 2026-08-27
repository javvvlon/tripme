import type { SearchFacets, SearchFilters } from '~/search_engine/contracts/search'
import type { FilterGroupKey } from './FilterPanel.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IFilterPanelProps {
  facets: SearchFacets
  groups?: readonly FilterGroupKey[]
  currency?: string
  loading?: boolean
  agentView?: boolean
}

export interface IFilterPanelEmits {
  change: [filters: SearchFilters]
}
