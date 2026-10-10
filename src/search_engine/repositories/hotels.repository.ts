import type { AnyObject } from '~/shared/contracts/data'
import type { IHotelSuggestion } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useHotelsRepository = () => {
  const http = useHttp()

  const suggest = async (from: string, to: string, q: string, signal?: AbortSignal): Promise<IHotelSuggestion[]> => {
    const response = await http.call<IHotelSuggestion[]>(
      'SearchEngine',
      'searchHotels',
      { from, to, q } as AnyObject,
      undefined,
      { signal },
    )

    return response.data ?? []
  }

  return { suggest }
}
