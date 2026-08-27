import { Model } from '~/shared/helpers/model'
import type { Money } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export enum Availability {
  Available = 'available',
  OnRequest = 'on_request',
  Stopped = 'stopped',
  Unknown = 'unknown',
}

export interface ISupplierRef {
  id: string
  name: string
}

export interface ITourRaw {
  id: string
  supplier: ISupplierRef
  hotelName: string
  hotelStars: number | null
  hotelSupplierCode: string
  hotelSlug: string | null
  hotelUrl: string | null
  bookingUrl: string | null
  district: string | null
  checkIn: string
  nights: number
  mealCode: string | null
  mealName: string | null
  roomName: string | null
  adults: number
  children: number
  price: { source: Money, converted?: Money }
  availability: Availability
  availabilityNote: string | null
  flightNote: string | null
  refundable: boolean | null
  programme: string | null
  fare: string | null
}

export interface ITour extends Omit<ITourRaw, 'price'> {
  price: Money
  comparablePrice: Money
}

export class Tour extends Model<ITour> {
  protected static override mapRaw(raw: ITourRaw): ITour {
    return {
      ...raw,
      /**
       * The operator's own figure, not our conversion — it is what the agent
       * will see in their cabinet, and a card showing a number nobody else
       * quotes is worse than a list in mixed currencies.
       *
       * The conversion is still carried, because sorting and the price filter
       * need one comparable scale across four operators.
       */
      price: raw.price.source,
      comparablePrice: raw.price.converted ?? raw.price.source,
    }
  }

  public isBookable(): boolean {
    return this.get('availability') === Availability.Available
  }

  public needsRequest(): boolean {
    return this.get('availability') === Availability.OnRequest
  }

  public isStopped(): boolean {
    return this.get('availability') === Availability.Stopped
  }

  public stars(): number {
    return this.get('hotelStars') ?? 0
  }

  public location(): string {
    return this.get('district') ?? ''
  }

  public hasDetails(): boolean {
    return Boolean(this.get('hotelUrl'))
  }

  public canBook(): boolean {
    return Boolean(this.get('bookingUrl')) && !this.isStopped()
  }
}
