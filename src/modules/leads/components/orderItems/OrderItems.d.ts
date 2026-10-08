import type { IOrderItemBody, IOrderItemRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IOrderItemsProps {
  items: IOrderItemRaw[]
  busy?: boolean
  locked?: boolean
  start?: string | null
  end?: string | null
}

export interface IOrderItemsEmits {
  rate: [itemId: string, rate: number]
  confirm: [itemId: string, supplierRef: string]
  save: [itemId: string | null, body: IOrderItemBody]
  remove: [itemId: string]
  issue: [itemId: string, file: File | null]
}
