import { Tour } from '~/search_engine/models/Tour'
import type { IRoutePage, IRoutePageRaw, IRouteSummary, IRouteSummaryRaw } from '~/search_engine/contracts/routes'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useRoutesRepository = () => {
  const http = useHttp()

  const list = async (): Promise<IRouteSummary[]> => {
    const response = await http.call<{ items: IRouteSummaryRaw[] }>('SearchEngine', 'fetchRoutes')

    return (response.data?.items ?? []).map(item => ({
      from: item.from,
      to: item.to,
      offers: item.offers,
      cheapest: item.offer ? Tour.fromRaw(item.offer) : null,
    }))
  }

  const one = async (from: string, to: string): Promise<IRoutePage> => {
    const response = await http.call<IRoutePageRaw>('SearchEngine', 'fetchRoute', { from, to })
    const raw = response.data

    return {
      from: raw.from,
      to: raw.to,
      date: raw.date,
      dateTo: raw.date_to,
      nights: raw.nights,
      adults: raw.adults,
      offers: raw.offers,
      cheapest: raw.cheapest ? Tour.fromRaw(raw.cheapest) : null,
      hotels: raw.hotels.map(item => Tour.fromRaw(item)),
    }
  }

  return { list, one }
}
