/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ServiceProduct = 'tour' | 'esim'

export const PRODUCT_ICONS: Record<ServiceProduct, string> = {
  tour: 'briefcase',
  esim: 'sim',
}

export const productOf = (trip: Record<string, unknown> | null | undefined): ServiceProduct =>
  trip?.product === 'esim' ? 'esim' : 'tour'
