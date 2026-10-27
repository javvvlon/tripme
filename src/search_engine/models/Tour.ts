import { Model } from '~/shared/helpers/model'
import type { Money } from '~/search_engine/contracts/search'
import { isHotDeparture } from '~/shared/helpers/hot'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export enum Availability {
  Available = 'available',
  OnRequest = 'on_request',
  Stopped = 'stopped',
  Unknown = 'unknown',
}

export type UzsBasis = 'operator' | 'cbu'

export interface IUzsPrice {
  amount: number
  currency: 'UZS'
  basis: UzsBasis
  rate: number
}

export interface ISupplierRef {
  id: string
  name: string
}

export interface ITourRaw {
  id: string
  supplier: ISupplierRef
  hotelName: string
  hotelKey?: string
  hotelStars: number | null
  hotelKind?: 'boutique' | 'apart' | null
  hotelSupplierCode: string
  hotelSlug: string | null
  hotelUrl: string | null
  bookingUrl: string | null
  district: string | null
  checkIn: string
  nights: number
  mealCode: string | null
  mealName: string | null
  mealPlan?: string | null
  roomName: string | null
  adults: number
  children: number
  price: { source: Money, converted?: Money, uzs?: IUzsPrice }
  availability: Availability
  availabilityNote: string | null
  flightNote: string | null
  refundable: boolean | null
  programme: string | null
  fare: string | null
  hot?: boolean
  oldPrice?: number | null
  instantConfirm?: boolean
  bestPrice?: boolean
}

export interface ITour extends Omit<ITourRaw, 'price'> {
  price: Money
  comparablePrice: Money
  uzs?: IUzsPrice | null
}

const roomKey = (room: string | null): string => (room ?? '')
  .toLowerCase()
  .replace(/\d+\s*(adl|adt|adults?|взр)\.?/g, ' ')
  .replace(/\d+\s*(chd|child|children|inf|реб)\.?/g, ' ')
  .replace(/\b(rooms?)\b|номера?/g, ' ')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()

export class Tour extends Model<ITour> {
  protected static override mapRaw(raw: ITourRaw): ITour {
    return {
      ...raw,
      price: raw.price.source,
      comparablePrice: raw.price.converted ?? raw.price.source,
      uzs: raw.price.uzs ?? null,
    }
  }

  public rankPrice(): number {
    return this.get('uzs')?.amount ?? this.get('comparablePrice').amount
  }

  public groupKey(): string {
    return this.get('hotelKey') || this.get('hotelName').trim().toLowerCase()
  }

  public packageKey(): string {
    const meal = this.get('mealPlan') || this.get('mealCode')?.toUpperCase() || this.get('mealName')?.trim().toLowerCase() || ''

    return [this.groupKey(), this.get('checkIn'), this.get('nights'), roomKey(this.get('roomName')), meal].join('|')
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

  public isHot(today?: string): boolean {
    const known = this.get('hot')

    return typeof known === 'boolean' && today === undefined ? known : isHotDeparture(this.get('checkIn'), this.isStopped(), today)
  }

  public oldComparablePrice(): Money | null {
    const old = Number(this.get('oldPrice'))
    const source = this.get('price').amount

    if (!Number.isFinite(old) || old <= source || source <= 0) return null

    const comparable = this.get('comparablePrice')

    return { amount: Math.round(comparable.amount * (old / source)), currency: comparable.currency }
  }

  public stars(): number {
    return this.get('hotelStars') ?? 0
  }

  public displayName(): string {
    const name = this.get('hotelName').replace(/\s*\d\s*\*+\s*\+?\s*$/, '').trim()

    if (name !== name.toUpperCase() || !/[A-Z]/.test(name)) return name

    return name.toLowerCase().replace(/(^|[\s\-'(&/])(\p{L})/gu, (_, gap: string, letter: string) => gap + letter.toUpperCase())
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
