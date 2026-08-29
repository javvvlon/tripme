import type { LeadSort } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const COLUMNS: Array<{ key: LeadSort, class?: string }> = [
  { key: 'order', class: 'is-num is-order' },
  { key: 'created', class: 'is-date' },
  { key: 'client' },
  { key: 'phone', class: 'is-phone' },
  { key: 'tour' },
  { key: 'dates', class: 'is-stay' },
  { key: 'party', class: 'is-num is-party' },
  { key: 'price', class: 'is-num is-price' },
  { key: 'supplier' },
  { key: 'status', class: 'is-status' },
]
