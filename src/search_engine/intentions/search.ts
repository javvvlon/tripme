import { Intention } from '~/shared/helpers/intentions'
import type { SearchRequest } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class SearchCriteriaIntention extends Intention<SearchRequest> {
  protected map = {
    mode: 'mode',
    from: 'from',
    to: 'to',
    date: 'date',
    nights: 'nights',
    adults: 'adults',
    kids: 'children',
  } as const

  public override toRequest(data: SearchRequest): Record<string, unknown> {
    const { filters } = data
    const query = super.toRequest(data)

    const list = (values: Array<string | number> | undefined) =>
      values?.length ? values.join(',') : undefined

    const withFilters: Record<string, unknown> = {
      ...query,
      stars: list(filters?.stars),
      meals: list(filters?.meals),
      resorts: list(filters?.resorts),
      hotels: list(filters?.hotels),
      suppliers: list(filters?.suppliers),
      priceMin: filters?.priceMin,
      priceMax: filters?.priceMax,
    }

    delete withFilters.filters
    delete withFilters.sort
    delete withFilters.size
    delete withFilters.page

    return Object.fromEntries(
      Object.entries(withFilters).filter(([, value]) =>
        value !== undefined && value !== null && value !== '' && value !== 0),
    )
  }
}
