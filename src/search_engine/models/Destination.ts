import { Model } from '~/shared/helpers/model'
import type { DestinationKind, Money } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDestinationRaw {
  id: string
  slug: string
  kind: DestinationKind
  name: string
  country_name: string | null
  country_slug: string | null
  iata_code: string | null
  image_url: string | null
  price_from: number | null
  price_currency: string | null
  nights_from: number | null
  is_popular: boolean
}

export interface IDestination {
  id: string
  slug: string
  kind: DestinationKind
  name: string
  countryName: string | null
  countrySlug: string | null
  iataCode: string | null
  imageUrl: string | null
  priceFrom: Money | null
  nightsFrom: number | null
  isPopular: boolean
}

export class Destination extends Model<IDestination> {
  protected static override mapRaw(raw: IDestinationRaw): IDestination {
    return {
      id: raw.id,
      slug: raw.slug,
      kind: raw.kind,
      name: raw.name,
      countryName: raw.country_name,
      countrySlug: raw.country_slug,
      iataCode: raw.iata_code,
      imageUrl: raw.image_url,
      priceFrom: raw.price_from !== null
        ? { amount: raw.price_from, currency: (raw.price_currency ?? 'USD') as Money['currency'] }
        : null,
      nightsFrom: raw.nights_from,
      isPopular: raw.is_popular,
    }
  }

  public fullName(): string {
    const country = this.get('countryName')
    return country ? `${this.get('name')}, ${country}` : this.get('name')
  }
}
