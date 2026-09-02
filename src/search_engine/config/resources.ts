import type { IResource } from '../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'SearchEngine',
  prefix: 'search',
  resources: {
    searchTours: {
      url: 'offers',
      method: 'GET',
      params: ['from', 'to', 'date', 'dateTo', 'nights', 'nightsTo', 'adults',
               'children', 'currency', 'stars', 'meals', 'resorts', 'hotels',
               'suppliers', 'priceMin', 'priceMax', 'page'],
    },
    soonestDeparture: {
      url: 'soonest',
      method: 'GET',
      params: ['from', 'to', 'date', 'nights', 'nightsTo', 'adults', 'children', 'currency'],
    },
    fetchTour: { url: 'offers/:tour_id/', method: 'GET' },
    suggestDestinations: {
      url: 'destinations/suggest/',
      method: 'GET',
      params: ['q', 'kind', 'limit'],
    },
    fetchDestinations: {
      url: 'destinations/',
      method: 'GET',
      params: ['kind', 'parent', 'popular', 'limit'],
    },
    fetchDestination: { url: 'destinations/:slug/', method: 'GET' },
    fetchPriceIndex: {
      url: 'destinations/price-index/',
      method: 'GET',
      params: ['from', 'nights', 'limit'],
    },
    fetchHotOffers: { url: 'offers/hot/', method: 'GET', params: ['from', 'limit'] },
  },
}

export const referencesResource: IResource = {
  name: 'References',
  prefix: 'references',
  resources: {
    fetchDepartures: { url: 'departures', method: 'GET' },
    fetchCountries: { url: 'countries', method: 'GET', params: ['from'] },
    fetchConstraints: { url: 'constraints', method: 'GET', params: ['from', 'to'] },
  },
}
