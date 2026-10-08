import { DEFAULT_KID_AGE } from '~/shared/composables/useSearchCriteria'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILeadOfferLinks {
  booking: string
  hotel: string
  search: string
}

const text = (value: unknown): string =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

const count = (value: unknown): number => {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0
}

export function kidAgesOf(trip: Partial<ILeadTrip> | null | undefined): number[] {
  const kids = count(trip?.children)
  const stored = Array.isArray(trip?.kid_ages)
    ? trip.kid_ages.map(Number).filter(age => Number.isInteger(age) && age >= 0 && age <= 17)
    : []

  return Array.from({ length: kids }, (_, index) => stored[index] ?? DEFAULT_KID_AGE)
}

export function offerLinks(trip: Partial<ILeadTrip> | null | undefined): ILeadOfferLinks {
  const from = text(trip?.route_from)
  const to = text(trip?.route_to)
  const date = text(trip?.check_in)

  const links: ILeadOfferLinks = {
    booking: text(trip?.booking_url),
    hotel: text(trip?.hotel_url),
    search: '',
  }

  if (!from || !to) return links

  const query: Record<string, string> = { from, to }

  if (date) query.date = date

  const nights = count(trip?.nights)
  const adults = count(trip?.adults)
  const kids = kidAgesOf(trip)

  if (nights) query.nights = String(nights)
  if (adults) query.adults = String(adults)
  if (kids.length) query.kids = kids.join(',')

  links.search = `/search?${new URLSearchParams(query).toString()}`

  return links
}
