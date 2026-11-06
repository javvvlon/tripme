/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ServiceProduct = 'tour' | 'hotel' | 'excursion' | 'esim'

export const PRODUCT_ICONS: Record<ServiceProduct, string> = {
  tour: 'briefcase',
  hotel: 'bed',
  excursion: 'landmark',
  esim: 'sim',
}

const PRODUCTS: ServiceProduct[] = ['hotel', 'excursion', 'esim']

export const productOf = (trip: Record<string, unknown> | null | undefined): ServiceProduct =>
  PRODUCTS.find(product => product === trip?.product) ?? 'tour'
