import type { PaymentStatus } from '~/modules/finance/contracts/finance'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPaymentBadgeProps {
  status: PaymentStatus
}
