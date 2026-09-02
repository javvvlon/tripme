import type { ILeadTrip } from '~/modules/leads/contracts/leads'
import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const tripFromTour = (tour: Tour, route?: { from: string, to: string }): ILeadTrip => ({
  hotel_name: tour.get('hotelName'),
  hotel_stars: tour.get('hotelStars'),
  hotel_code: tour.get('hotelSupplierCode'),
  hotel_url: tour.get('hotelUrl'),
  booking_url: tour.get('bookingUrl'),
  supplier_id: tour.get('supplier').id,
  supplier_name: tour.get('supplier').name,
  offer_id: tour.get('id'),
  check_in: tour.get('checkIn'),
  nights: tour.get('nights'),
  adults: tour.get('adults'),
  children: tour.get('children'),
  meal_code: tour.get('mealCode'),
  meal_name: tour.get('mealName'),
  room_name: tour.get('roomName'),
  district: tour.get('district'),
  availability: tour.get('availability'),
  refundable: tour.get('refundable'),
  programme: tour.get('programme'),
  fare: tour.get('fare'),
  price_amount: tour.get('price').amount,
  price_currency: tour.get('price').currency,
  route_from: route?.from ?? '',
  route_to: route?.to ?? '',
})

export const tripFromLead = (lead: { trip: Record<string, unknown>, hotel_name: string, supplier_name: string, check_in: string | null, nights: number, adults: number, children: number, price_amount: number | null, price_currency: string, destination: string }): ILeadTrip => ({
  ...(lead.trip as Partial<ILeadTrip>),
  hotel_name: lead.hotel_name,
  supplier_name: lead.supplier_name,
  check_in: lead.check_in,
  nights: lead.nights,
  adults: lead.adults,
  children: lead.children,
  price_amount: lead.price_amount,
  price_currency: lead.price_currency,
  route_to: lead.destination,
} as ILeadTrip)
