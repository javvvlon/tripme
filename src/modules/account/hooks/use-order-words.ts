import { formatDate } from '~/shared/helpers/format-date'
import type { ICustomerOrder } from '~/modules/account/contracts/account'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOrderWords = () => {
  const { t, locale } = useI18n()

  const day = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { day: 'numeric', month: 'short', year: 'numeric' })

  const moment = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { dateStyle: 'medium', timeStyle: 'short' })

  const span = (from: string | null, to: string | null): string => {
    if (!from && !to) return '—'
    if (from && to) return `${day(from)} — ${day(to)}`

    return day(from ?? to)
  }

  const travellers = (order: Pick<ICustomerOrder, 'adults' | 'children'>): string => {
    const parts = [t('account.orders.adults', { n: order.adults }, order.adults)]

    if (order.children) parts.push(t('account.orders.children', { n: order.children }, order.children))

    return parts.join(', ')
  }

  const price = (order: Pick<ICustomerOrder, 'price_amount' | 'price_currency'>): string => {
    if (order.price_amount === null) return t('account.orders.priceLater')

    const amount = order.price_amount.toLocaleString(locale.value, { maximumFractionDigits: 2 })

    return `${amount} ${order.price_currency}`.trim()
  }

  return { day, moment, span, travellers, price }
}
