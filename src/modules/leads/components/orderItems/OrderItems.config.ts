import type { OrderItemKind } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ITEM_ICONS: Record<OrderItemKind, string> = {
  package: 'briefcase',
  flight: 'plane',
  hotel: 'bed',
  transfer: 'map',
  insurance: 'shield',
  excursion: 'pin',
  visa: 'doc',
}
