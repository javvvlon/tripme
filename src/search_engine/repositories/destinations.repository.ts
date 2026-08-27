import { Destination } from '~/search_engine/models/Destination'
import type { IDestinationRaw } from '~/search_engine/models/Destination'
import type { AnyObject } from '~/shared/contracts/data'
import type { DestinationKind } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useDestinationsRepository = () => {
  const http = useHttp()

  const suggest = async (q: string, kind?: DestinationKind, limit = 8): Promise<Destination[]> => {
    const response = await http.call<IDestinationRaw[]>(
      'SearchEngine',
      'suggestDestinations',
      { q, kind, limit } as AnyObject,
    )

    return (response.data ?? []).map(d => Destination.fromRaw(d))
  }

  const fetchPopular = async (limit = 12): Promise<Destination[]> => {
    const response = await http.call<IDestinationRaw[]>(
      'SearchEngine',
      'fetchDestinations',
      { popular: true, limit },
    )

    return (response.data ?? []).map(d => Destination.fromRaw(d))
  }

  const fetchOne = async (slug: string): Promise<Destination> => {
    const response = await http.call<IDestinationRaw>(
      'SearchEngine',
      'fetchDestination',
      { slug },
    )

    return Destination.fromRaw(response.data)
  }

  const fetchPriceIndex = async (from: string, nights?: number, limit = 8): Promise<Destination[]> => {
    const response = await http.call<IDestinationRaw[]>(
      'SearchEngine',
      'fetchPriceIndex',
      { from, nights, limit } as AnyObject,
    )

    return (response.data ?? []).map(d => Destination.fromRaw(d))
  }

  return { suggest, fetchPopular, fetchOne, fetchPriceIndex }
}
