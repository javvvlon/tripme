import type { ServiceProduct } from '~/modules/leads/helpers/product'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LEAD_TITLES: Record<ServiceProduct, string> = {
  tour: 'lead.title',
  hotel: 'lead.titles.hotel',
  excursion: 'lead.titles.excursion',
  esim: 'lead.title',
}
