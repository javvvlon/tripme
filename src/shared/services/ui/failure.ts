/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IApiFailure {
  data?: { message?: string | string[] }
  statusCode?: number
}

const KNOWN: Array<[RegExp, string]> = [
  [/^This lead has a paid order and cannot be rejected$/i, 'cms.errors.guards.leadPaid'],
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
