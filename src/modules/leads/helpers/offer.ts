import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILeadOfferLinks {
  /** The exact offer at the operator, as it was when the client applied. */
  booking: string
  /** The hotel's own page at the operator. */
  hotel: string
  /** Our own search, rebuilt from what the client asked for. */
  search: string
}

const text = (value: unknown): string =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

const count = (value: unknown): number => {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0
}

/**
 * Everywhere an agent might want to go from a lead.
 *
 * The operator link is stored on the lead the moment it arrives, so it
 * survives even after the offer stops being sold — but leads made by hand,
 * and the oldest ones, have nothing stored. The search is rebuilt from the
 * route and dates instead, which every lead carries, so there is always a
 * way back to something.
 */
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
  const kids = count(trip?.children)

  if (nights) query.nights = String(nights)
  if (adults) query.adults = String(adults)
  if (kids) query.kids = String(kids)

  links.search = `/search?${new URLSearchParams(query).toString()}`

  return links
}
