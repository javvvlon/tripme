import type { IOrderConfirmation, OrderStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IOrderChecklistProps {
  confirmation: IOrderConfirmation
  status: OrderStatus
  busy?: boolean
}

export type ChecklistTarget = 'services' | 'finance' | 'details'

export interface IOrderChecklistEmits {
  confirm: []
  request: []
  contract: [file: File]
  go: [tab: ChecklistTarget]
}
