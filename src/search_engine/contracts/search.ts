/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export enum DestinationKind {
  Country = 'country',
  City = 'city',
  Resort = 'resort',
  Airport = 'airport',
}

export enum SearchMode {
  Tours = 'tours',
  Flights = 'flights',
  Hotels = 'hotels',
}

export type CurrencyCode = 'USD' | 'UZS' | 'EUR'

export interface Money {
  amount: number
  currency: CurrencyCode
}

export interface SearchCriteria {
  mode: SearchMode
  from: string
  to: string
  date: string
  nights: number
  adults: number
  kids: number
}

export interface SearchFilters {
  stars: number[]
  meals: string[]
  resorts: string[]
  hotels: string[]
  priceMin?: number
  priceMax?: number
  suppliers: string[]
}

export interface SearchRequest extends SearchCriteria {
  filters: Partial<SearchFilters>
  page: number
  size: number
  sort: SearchSort
}

export enum SearchSort {
  Popular = 'popular',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
  RatingDesc = 'rating_desc',
}

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface SearchFacets {
  suppliers: FacetOption[]
  stars: FacetOption[]
  meals: FacetOption[]
  districts: FacetOption[]
  availability: FacetOption[]
  /** the cheapest offer as its operator quoted it — what the heading shows */
  priceFrom: { amount: number, currency: string } | null
  priceBuckets: { from: number, to: number, count: number }[]
  priceMin: number | null
  priceMax: number | null
  currency: string | null
  partial: boolean
  total: number
}
