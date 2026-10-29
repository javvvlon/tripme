import type {
  IReferenceItem,
  IRouteAnswer,
  IRouteConstraints,
  IUzsRates,
} from '~/search_engine/contracts/references'
import type { AnyObject } from '~/shared/contracts/data'
import type { ProductMode } from '~/search_engine/contracts/search'

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

  const fetchCountries = async (from?: string, mode?: ProductMode): Promise<IRouteAnswer> => {
    const response = await http.call<IRouteAnswer>(
      'References',
      'fetchCountries',
      (mode ? { mode } : { from }) as AnyObject,
    )

    return response.data ?? { items: [], from: from ?? null }
  }

  const fetchConstraints = async (from: string, to: string, mode?: ProductMode): Promise<IRouteConstraints | null> => {
    if (!to || (!from && !mode)) return null

    const response = await http.call<IRouteConstraints>(
      'References',
      'fetchConstraints',
      (mode ? { to, mode } : { from, to }) as AnyObject,
    )

    return response.data ?? null
  }

  const fetchRates = async (): Promise<IUzsRates | null> => {
    const response = await http.call<IUzsRates>('References', 'fetchRates')

    return response.data?.rates?.USD ? response.data : null
  }

  return { fetchDepartures, fetchCountries, fetchConstraints, fetchRates }
}
