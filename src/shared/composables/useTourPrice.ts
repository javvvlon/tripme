import type { Tour } from '~/search_engine/models/Tour'
import type { IMoneyLike } from '~/shared/composables/useUzsRates'
import { useUzsRates } from '~/shared/composables/useUzsRates'
import { formatMoney } from '~/shared/utils/format'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const ROUND_TO = 1000

export const useTourPrice = () => {
  const { t, locale } = useI18n()
  const { toUzs } = useUzsRates()

  const amount = (value: number): string =>
    new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)

  const compact = (value: number): string =>
    new Intl.NumberFormat(locale.value, { notation: 'compact', maximumFractionDigits: 1 }).format(value)

  const foreign = (money: IMoneyLike): string =>
    formatMoney({ amount: money.amount, currency: money.currency as 'USD' }, locale.value)

  const sum = (value: number): string => t('price.sum', { amount: amount(value) })

  const uzsOf = (tour: Tour): number | null => tour.get('uzs')?.amount ?? toUzs(tour.get('comparablePrice'))

  const scaled = (tour: Tour, money: IMoneyLike): number | null => {
    const base = tour.get('comparablePrice').amount
    const uzs = uzsOf(tour)

    return uzs === null || !base ? null : Math.round((money.amount * uzs) / base / ROUND_TO) * ROUND_TO
  }

  const main = (tour: Tour): string => {
    const uzs = uzsOf(tour)

    return uzs === null ? foreign(tour.get('comparablePrice')) : sum(uzs)
  }

  const reference = (tour: Tour): string =>
    uzsOf(tour) === null ? '' : t('price.approx', { price: foreign(tour.get('comparablePrice')) })

  const derived = (tour: Tour, money: IMoneyLike): string => {
    const uzs = scaled(tour, money)

    return uzs === null ? foreign(money) : sum(uzs)
  }

  const convert = (money: IMoneyLike, usdRate?: number): number | null =>
    money.currency === 'USD' && usdRate ? Math.round((money.amount * usdRate) / ROUND_TO) * ROUND_TO : toUzs(money)

  const moneySum = (money: IMoneyLike, usdRate?: number): string => {
    const uzs = convert(money, usdRate)

    return uzs === null ? foreign(money) : sum(uzs)
  }

  const moneyCompact = (money: IMoneyLike, usdRate?: number): string => {
    const uzs = convert(money, usdRate)

    return uzs === null ? foreign(money) : t('price.sum', { amount: compact(uzs) })
  }

  return { uzsOf, main, reference, derived, sum, moneySum, moneyCompact }
}
