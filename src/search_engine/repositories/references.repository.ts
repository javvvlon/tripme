import type {
  IReferenceItem,
  IRouteAnswer,
  IRouteConstraints,
  IUzsRates,
} from '~/search_engine/contracts/references'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useReferencesRepository = () => {
  const http = useHttp()

  const fetchDepartures = async (): Promise<IReferenceItem[]> => {
    const response = await http.call<{ items: IReferenceItem[] }>(
      'References',
      'fetchDepartures',
    )

    return response.data?.items ?? []
  }

  const fetchCountries = async (from?: string): Promise<IRouteAnswer> => {
    const response = await http.call<IRouteAnswer>(
      'References',
      'fetchCountries',
      { from } as AnyObject,
    )

    return response.data ?? { items: [], from: from ?? null }
  }

  const fetchConstraints = async (from: string, to: string): Promise<IRouteConstraints | null> => {
    if (!from || !to) return null

    const response = await http.call<IRouteConstraints>(
      'References',
      'fetchConstraints',
      { from, to },
    )

    return response.data ?? null
  }

  const fetchRates = async (): Promise<IUzsRates | null> => {
    const response = await http.call<IUzsRates>('References', 'fetchRates')

    return response.data?.rates?.USD ? response.data : null
  }

  return { fetchDepartures, fetchCountries, fetchConstraints, fetchRates }
}
