import { Tour } from '~/search_engine/models/Tour'
import type { ITourRaw } from '~/search_engine/models/Tour'
import { SearchCriteriaIntention } from '~/search_engine/intentions/search'
import type { SearchRequest, SearchFacets } from '~/search_engine/contracts/search'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ISupplierStatus {
  supplier: { id: string, name: string }
  state: 'pending' | 'searching' | 'done' | 'failed' | 'unsupported'
  offers: number
  reason?: string
  tookMs?: number
}

export interface ITourSearchResult {
  items: Tour[]
  total: number
  page: number
  hasMore: boolean
  statuses: ISupplierStatus[]
  facets: SearchFacets | null
}

interface ISearchResponseRaw {
  total: number
  page: number
  hasMore: boolean
  items: ITourRaw[]
  statuses: ISupplierStatus[]
  facets: SearchFacets | null
}

export const useToursRepository = () => {
  const http = useHttp()

  const search = async (
    request: SearchRequest,
    page = 1,
    signal?: AbortSignal,
  ): Promise<ITourSearchResult> => {
    const params = { ...new SearchCriteriaIntention().toRequest(request), page }

    const response = await http.call<ISearchResponseRaw>(
      'SearchEngine',
      'searchTours',
      params as AnyObject,
      undefined,
      { signal },
    )

    return {
      items: (response.data?.items ?? []).map(item => Tour.fromRaw(item)),
      total: response.data?.total ?? 0,
      page: response.data?.page ?? page,
      hasMore: response.data?.hasMore ?? false,
      statuses: response.data?.statuses ?? [],
      facets: response.data?.facets ?? null,
    }
  }

  const fetchOne = async (id: string): Promise<Tour> => {
    const response = await http.call<ITourRaw>('SearchEngine', 'fetchTour', { tour_id: id })
    return Tour.fromRaw(response.data)
  }

  return { search, fetchOne }
}
