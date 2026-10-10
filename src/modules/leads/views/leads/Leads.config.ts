import type { LeadSort } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const COLUMNS: Array<{ key: string, label: string, sort?: LeadSort, class: string }> = [
  { key: 'client', label: 'cms.leads.columns.client', sort: 'client', class: 'is-client' },
  { key: 'tour', label: 'cms.leads.list.tour', sort: 'tour', class: 'is-tour' },
  { key: 'price', label: 'cms.leads.columns.price', sort: 'price', class: 'is-price' },
  { key: 'status', label: 'cms.leads.columns.status', sort: 'status', class: 'is-status' },
  { key: 'owner', label: 'cms.ownership.column', class: 'is-owner' },
]
