/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IApiFailure {
  data?: { message?: string | string[] }
  statusCode?: number
}

const KNOWN: Array<[RegExp, string]> = [
  [/^This lead has a (paid|confirmed) order and cannot be rejected$/i, 'cms.errors.guards.leadPaid'],
  [/^The order cannot be confirmed yet/i, 'cms.errors.guards.confirmationIncomplete'],
  [/^A receipt is required for client money$/i, 'cms.errors.guards.receiptRequired'],
  [/^Only a manager can reverse a payment$/i, 'cms.errors.guards.reverseForbidden'],
  [/^This payment is already reversed$/i, 'cms.errors.guards.alreadyReversed'],
  [/^A reversal cannot be reversed$/i, 'cms.errors.guards.alreadyReversed'],
  [/^An order with recorded payments cannot be deleted$/i, 'cms.errors.guards.orderHasPayments'],
  [/^A payment receipt cannot be deleted$/i, 'cms.errors.guards.receiptLocked'],
  [/^A cancelled service cannot be (confirmed|changed|issued)$/i, 'cms.errors.guards.serviceCancelled'],
  [/^This service is already cancelled$/i, 'cms.errors.guards.serviceCancelled'],
  [/^An issued service cannot be changed$/i, 'cms.errors.guards.serviceIssued'],
  [/^This service is already issued$/i, 'cms.errors.guards.serviceIssued'],
  [/^The tour package (follows the order details|is issued with the order)$/i, 'cms.errors.guards.packageLocked'],
  [/^A closed order cannot take new services$/i, 'cms.errors.guards.orderClosed'],
  [/^Pick a tour for the lead before creating an order$/i, 'cms.leads.orderNeedsTour'],
  [/^The service cannot end before it starts$/i, 'cms.errors.guards.serviceDates'],
  [/^Only a manager records money paid to suppliers$/i, 'cms.errors.guards.supplierPaymentForbidden'],
  [/^A payment cannot be dated in the future$/i, 'cms.errors.guards.futurePayment'],
  [/^The amount must be positive$/i, 'cms.errors.guards.amountPositive'],
  [/^No exchange rate available/i, 'cms.errors.guards.rateMissing'],
  [/^The rate must be a positive number$/i, 'cms.errors.guards.rateMissing'],
  [/^The supplier booking number is required$/i, 'cms.errors.guards.supplierRefRequired'],
  [/^The deposit must be a whole percent from 0 to 100$/i, 'cms.errors.guards.depositPercent'],
  [/^An order that has been paid cannot be deleted$/i, 'cms.errors.guards.orderPaid'],
  [/^A rejected lead cannot take new orders$/i, 'cms.errors.guards.leadRejected'],
  [/^Unknown order status$/i, 'cms.errors.guards.unknownStatus'],
  [/^Lead not found$/i, 'cms.errors.guards.leadMissing'],
  [/^Order not found$/i, 'cms.errors.guards.orderMissing'],
  [/^A first name is required$/i, 'cms.errors.guards.firstNameRequired'],
  [/^A phone number is required$/i, 'cms.errors.guards.phoneRequired'],
  [/^The current password is wrong$/i, 'account.profile.wrongPassword'],
  [/^The balance cannot go below zero$/i, 'cms.errors.guards.pointsBelowZero'],
  [/^An adjustment needs a non-zero amount$/i, 'cms.points.customer.amountRequired'],
  [/^A tier needs a name$/i, 'cms.errors.guards.tierName'],
  [/^A threshold must be zero or more points$/i, 'cms.errors.guards.tierThreshold'],
  [/^A discount must be between 0 and 100 percent$/i, 'cms.errors.guards.tierDiscount'],
  [/^Rate for \w+ must be a number of points per unit$/i, 'cms.errors.guards.pointsRate'],
  [/^Tier not found$/i, 'cms.errors.guards.tierMissing'],
  [/^Customer not found$/i, 'cms.errors.guards.customerMissing'],
  [/^A cancelled order needs a reason$/i, 'cms.errors.guards.cancelReason'],
  [/^The passport expires before the trip ends$/i, 'cms.errors.guards.passportExpired'],
  [/^The passport must stay valid \d+ months after the trip ends$/i, 'cms.errors.guards.passportShort'],
]

const TRANSITION = /^An order cannot go from (\w+) to (\w+)$/i

const first = (message: string | string[] | undefined): string =>
  (Array.isArray(message) ? message[0] : message) ?? ''

export function readFailure(
  error: unknown,
  translate: (key: string, params?: Record<string, unknown>) => string,
): string {
  const message = first((error as IApiFailure)?.data?.message).trim()

  if (!message) return translate('cms.errors.save')

  const transition = TRANSITION.exec(message)

  if (transition) {
    return translate('cms.errors.guards.transition', {
      from: translate(`cms.orders.status.${transition[1]}`),
      to: translate(`cms.orders.status.${transition[2]}`),
    })
  }

  for (const [pattern, key] of KNOWN) {
    if (pattern.test(message)) return translate(key)
  }

  if (import.meta.dev) console.warn(`[toast] untranslated API refusal: ${message}`)

  return translate('cms.errors.save')
}
