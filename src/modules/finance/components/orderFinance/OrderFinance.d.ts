import type { IFinanceRaw } from '~/modules/finance/contracts/finance'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IOrderFinanceProps {
  orderId: string
  version?: number
}

export interface IOrderFinanceEmits {
  changed: [finance: IFinanceRaw]
}
