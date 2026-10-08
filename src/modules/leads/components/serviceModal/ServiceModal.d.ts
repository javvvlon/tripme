import type { IOrderItemBody, IOrderItemRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IServiceModalProps {
  item?: IOrderItemRaw | null
  start?: string | null
  end?: string | null
  busy?: boolean
}

export interface IServiceModalEmits {
  save: [body: IOrderItemBody]
}

export interface IServiceDraft {
  kind: IOrderItemBody['kind']
  title: string
  supplier: string
  start: string
  end: string
  amount: number | null
  currency: string
  note: string
}
