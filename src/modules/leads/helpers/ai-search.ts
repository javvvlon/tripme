import { FLEXIBLE_NIGHTS } from '~/search_engine/intentions/search'
import type { ILeadSearchDestination, ILeadSearchPlan } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPlanRoom {
  adults: number
  kidAges: number[]
}

export interface IPlanTarget {
  destination?: ILeadSearchDestination
  room?: IPlanRoom
}

export const ROOM_GUESTS = 4

export function roomsOf(adults: number, kidAges: number[], perRoom = ROOM_GUESTS): IPlanRoom[] {
  const count = Math.max(1, Math.min(adults, Math.ceil((adults + kidAges.length) / perRoom)))
  const rooms: IPlanRoom[] = Array.from({ length: count }, () => ({ adults: 0, kidAges: [] }))

  for (let index = 0; index < adults; index++) rooms[index % count]!.adults++

  const roomy = () => rooms.reduce((best, room) => (room.adults + room.kidAges.length < best.adults + best.kidAges.length ? room : best))

  for (const age of kidAges) roomy().kidAges.push(age)

  return rooms
}

export function destinationsOf(plan: ILeadSearchPlan): ILeadSearchDestination[] {
  if (plan.destinations?.length) return plan.destinations

  return [{ to: plan.to, country: plan.country, resort: plan.resort, areas: [], hotels: plan.hotels, missing_hotels: plan.missing_hotels, note: '' }]
}

export function areasOf(destination: ILeadSearchDestination | undefined): string[] {
  if (!destination?.areas?.length) return []

  return [...new Set([destination.resort, ...destination.areas].map(area => area.trim()).filter(Boolean))]
}

export function planQuery(plan: ILeadSearchPlan, leadId: string, target: IPlanTarget = {}): Record<string, string> {
  const query: Record<string, string> = {}
  const destination = target.destination ?? destinationsOf(plan)[0]
  const adults = target.room?.adults ?? plan.adults
  const kidAges = target.room?.kidAges ?? plan.kid_ages
  const hotels = destination?.hotels ?? []

  if (plan.from) query.from = plan.from.slug
  if (destination?.to) query.to = destination.to.slug
  if (plan.date_from) query.date = plan.date_from
  if (plan.date_from && plan.date_to > plan.date_from) query.dateTo = plan.date_to

  query.nights = String(plan.nights ?? FLEXIBLE_NIGHTS.around)
  query.adults = String(adults)

  if (kidAges.length) query.kids = kidAges.join(',')

  const areas = areasOf(destination)

  if (areas.length) query.areas = areas.join(',')
  if (hotels.length) query.hotels = hotels.map(hotel => hotel.key).join(',')
  else if (plan.stars.length) query.stars = plan.stars.join(',')
  if (plan.meals.length) query.meals = plan.meals.join(',')

  query.lead = leadId

  return query
}
