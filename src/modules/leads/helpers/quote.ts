import { passportProblem } from './compliance'
import { Availability, Tour } from '~/search_engine/models/Tour'
import type { CurrencyCode } from '~/search_engine/contracts/search'
import type { ILeadTrip, IOrderRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const QUOTE_MAX = 3

export type QuoteTier = 'budget' | 'optimal' | 'comfort'

export type Translate = (key: string, params?: Record<string, unknown>, plural?: number) => string

export interface IQuoteOptions {
  tours: Tour[]
  locale: string
  t: Translate
  client: string
  destination: string
  departure: string
  includes: string
  manager: string
  uzsRate: number | null
  today: string
}

const textOf = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

export function tourFromOrder(order: IOrderRaw): Tour {
  const trip = (order.trip ?? {}) as Partial<ILeadTrip> & Record<string, unknown>
  const money = {
    amount: Number(order.price_amount ?? trip.price_amount ?? 0),
    currency: (order.price_currency || textOf(trip.price_currency) || 'USD') as CurrencyCode,
  }

  return new Tour({
    id: `order:${order.uuid}`,
    supplier: { id: textOf(trip.supplier_id) ?? '', name: order.supplier_name || textOf(trip.supplier_name) || '' },
    hotelName: order.hotel_name || textOf(trip.hotel_name) || '',
    hotelStars: Number(trip.hotel_stars) || null,
    hotelSupplierCode: textOf(trip.hotel_code) ?? '',
    hotelSlug: null,
    hotelUrl: textOf(trip.hotel_url),
    bookingUrl: textOf(trip.booking_url),
    district: textOf(trip.district),
    checkIn: order.check_in || textOf(trip.check_in) || '',
    nights: order.nights || Number(trip.nights) || 0,
    mealCode: textOf(trip.meal_code),
    mealName: textOf(trip.meal_name),
    roomName: textOf(trip.room_name),
    adults: order.adults,
    children: order.children,
    price: money,
    comparablePrice: money,
    availability: (textOf(trip.availability) as Availability | null) ?? Availability.Unknown,
    availabilityNote: null,
    flightNote: null,
    refundable: typeof trip.refundable === 'boolean' ? trip.refundable : null,
    programme: textOf(trip.programme),
    fare: textOf(trip.fare),
  })
}

export function tiersFor(count: number): QuoteTier[] {
  if (count <= 1) return []
  if (count === 2) return ['budget', 'comfort']

  return ['budget', 'optimal', 'comfort']
}

export function byPrice(tours: Tour[]): Tour[] {
  return [...tours].sort((a, b) => a.get('comparablePrice').amount - b.get('comparablePrice').amount)
}

export function quotePassportIssues(tours: Tour[], expires: string): Array<{ tour: Tour, problem: 'expired' | 'short' }> {
  if (!expires) return []

  return tours.flatMap((tour) => {
    const problem = passportProblem({
      return_date: null,
      check_in: tour.get('checkIn'),
      nights: tour.get('nights'),
      passport_expires_at: expires,
    })

    return problem ? [{ tour, problem }] : []
  })
}

const day = (iso: string, locale: string, days = 0): string => {
  const at = new Date(`${iso}T00:00:00Z`)

  at.setUTCDate(at.getUTCDate() + days)

  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(at)
}

const money = (amount: number, currency: string, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

const sum = (amount: number, locale: string): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(amount / 1000) * 1000)

export function buildQuote(options: IQuoteOptions): string {
  const { t, locale } = options
  const tours = byPrice(options.tours)
  const tiers = tiersFor(tours.length)
  const lines: string[] = [t('quote.text.title')]

  if (options.client.trim()) lines.push(t('quote.text.for', { name: options.client.trim() }))

  const route = [options.departure, options.destination].filter(Boolean)
  if (route.length === 2) lines.push(t('quote.text.route', { from: route[0], to: route[1] }))

  const first = tours[0]

  if (first) {
    const guests = [t('search.adults', { n: first.get('adults') }, first.get('adults'))]

    if (first.get('children')) guests.push(t('search.kids', { n: first.get('children') }, first.get('children')))

    lines.push(t('quote.text.party', { party: guests.join(', ') }))
  }

  tours.forEach((tour, index) => {
    const tier = tiers[index]
    const heading = tier
      ? t('quote.text.variantTier', { n: index + 1, tier: t(`quote.tier.${tier}`) })
      : t('quote.text.variant', { n: index + 1 })

    const stars = tour.stars() ? ` ${tour.stars()}*` : ''
    const place = tour.location() ? `, ${tour.location()}` : ''
    const price = tour.get('comparablePrice')
    const uzs = options.uzsRate && price.currency === 'USD'
      ? ` (${t('quote.text.approxUzs', { amount: sum(price.amount * options.uzsRate, locale) })})`
      : ''

    lines.push('')
    lines.push(heading)
    lines.push(`${tour.displayName()}${stars}${place}`)
    if (tour.get('checkIn')) {
      lines.push(t('quote.text.dates', {
        from: day(tour.get('checkIn'), locale),
        to: day(tour.get('checkIn'), locale, tour.get('nights')),
        nights: t('search.nights', { n: tour.get('nights') }, tour.get('nights')),
      }))
    }

    if (tour.get('mealName')) lines.push(t('quote.text.meal', { meal: tour.get('mealName') }))
    if (tour.get('roomName')) lines.push(t('quote.text.room', { room: tour.get('roomName') }))

    if (price.amount > 0) {
      lines.push(t('quote.text.price', { price: `${money(price.amount, price.currency, locale)}${uzs}` }))
    }

    if (tour.get('hotelUrl')) lines.push(t('quote.text.hotel', { url: tour.get('hotelUrl') }))
  })

  lines.push('')

  if (options.includes.trim()) lines.push(t('quote.text.includes', { includes: options.includes.trim() }))

  lines.push(t('quote.text.payment'))
  lines.push(t('quote.text.validity', { date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(options.today)) }))

  if (options.manager.trim()) {
    lines.push('')
    lines.push(t('quote.text.manager', { name: options.manager.trim() }))
  }

  return lines.join('\n')
}
