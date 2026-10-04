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

export type SearchStreamEvent =
  | { type: 'start', statuses: ISupplierStatus[] }
  | { type: 'offers', statuses: ISupplierStatus[], items: Tour[], facets: SearchFacets }
  | { type: 'done', statuses: ISupplierStatus[], hasMore: boolean, total: number }

interface ISearchStreamRaw {
  type: SearchStreamEvent['type']
  statuses: ISupplierStatus[]
  items?: ITourRaw[]
  facets?: SearchFacets
  hasMore?: boolean
  total?: number
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

  const stream = (
    request: SearchRequest,
    onEvent: (event: SearchStreamEvent) => void,
    onError: (received: boolean) => void,
  ): (() => void) => {
    const params = new URLSearchParams(
      Object.entries(new SearchCriteriaIntention().toRequest(request)).map(([k, v]) => [k, String(v)]),
    )
    const base = String(useRuntimeConfig().public.apiBase).replace(/\/+$/, '')
    const source = new EventSource(`${base}/search/offers/stream?${params.toString()}`)

    let received = false
    let finished = false

    source.onmessage = (message) => {
      received = true

      const raw = JSON.parse(message.data) as ISearchStreamRaw

      if (raw.type === 'offers') {
        onEvent({
          type: 'offers',
          statuses: raw.statuses,
          items: (raw.items ?? []).map(item => Tour.fromRaw(item)),
          facets: raw.facets!,
        })
      }
      else if (raw.type === 'done') {
        finished = true
        source.close()
        onEvent({ type: 'done', statuses: raw.statuses, hasMore: Boolean(raw.hasMore), total: raw.total ?? 0 })
      }
      else {
        onEvent({ type: 'start', statuses: raw.statuses })
      }
    }

    source.onerror = () => {
      if (finished) return

      source.close()
      onError(received)
    }

    return () => source.close()
  }

  const soonestDeparture = async (request: SearchRequest): Promise<string> => {
    const { from, to, nights, adults, kids } = request

    const response = await http.call<{ date: string | null }>(
      'SearchEngine',
      'soonestDeparture',
      { from, to, nights, adults, children: kids ? String(kids) : undefined },
    )

    return response.data?.date ?? ''
  }

  const fetchOne = async (id: string): Promise<Tour> => {
    const response = await http.call<ITourRaw>('SearchEngine', 'fetchTour', { tour_id: id })
    return Tour.fromRaw(response.data)
  }

  return { search, stream, soonestDeparture, fetchOne }
}
