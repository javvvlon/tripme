/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IApiFailure {
  data?: { message?: string | string[] }
  statusCode?: number
}

/**
 * The API refuses in English, because its messages are written for whoever is
 * reading the logs. The interface is Russian, so the refusal is matched here
 * and said again in the reader's language.
 *
 * Order matters only in that the status-transition pattern is checked apart
 * from the fixed phrases.
 */
const KNOWN: Array<[RegExp, string]> = [
  [/^This lead has a paid order and cannot be rejected$/i, 'cms.errors.guards.leadPaid'],
  [/^An order that has been paid cannot be deleted$/i, 'cms.errors.guards.orderPaid'],
  [/^A rejected lead cannot take new orders$/i, 'cms.errors.guards.leadRejected'],
  [/^Unknown order status$/i, 'cms.errors.guards.unknownStatus'],
  [/^Lead not found$/i, 'cms.errors.guards.leadMissing'],
  [/^Order not found$/i, 'cms.errors.guards.orderMissing'],
  [/^A first name is required$/i, 'cms.errors.guards.firstNameRequired'],
  [/^A phone number is required$/i, 'cms.errors.guards.phoneRequired'],
]

const TRANSITION = /^An order cannot go from (\w+) to (\w+)$/i

const first = (message: string | string[] | undefined): string =>
  (Array.isArray(message) ? message[0] : message) ?? ''

/**
 * Turns whatever came back into something worth showing a person.
 *
 * `translate` and `status` come from the caller so this stays free of Vue —
 * it is called from services, not only from components.
 */
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

  /**
   * An unmapped refusal is a gap in the table above, not something to show
   * raw: an English sentence in a Russian interface reads as a crash.
   */
  if (import.meta.dev) console.warn(`[toast] untranslated API refusal: ${message}`)

  return translate('cms.errors.save')
}
