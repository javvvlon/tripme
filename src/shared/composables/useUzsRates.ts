import { useReferencesRepository } from '~/search_engine/repositories/references.repository'
import type { IUzsRates } from '~/search_engine/contracts/references'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMoneyLike {
  amount: number
  currency: string
}

const ROUND_TO = 1000

export const useUzsRates = () => {
  const { fetchRates } = useReferencesRepository()
  const { t, locale } = useI18n()

  const { data: rates } = useAsyncData<IUzsRates | null>(
    'uzs-rates',
    () => fetchRates().catch(() => null),
    { default: () => null },
  )

  const toUzs = (money: IMoneyLike): number | null => {
    if (money.currency === 'UZS') return money.amount

    const rate = rates.value?.rates?.[money.currency]

    return rate ? Math.round((money.amount * rate) / ROUND_TO) * ROUND_TO : null
  }

  const amount = (value: number) =>
    new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)

  const approxUzs = (money: IMoneyLike): string => {
    if (money.currency === 'UZS') return ''

    const value = toUzs(money)

    return value === null ? '' : t('price.uzsApprox', { amount: amount(value) })
  }

  const usdRate = computed(() => {
    const rate = rates.value?.rates?.USD

    return rate ? amount(Math.round(rate)) : ''
  })

  return { rates, toUzs, approxUzs, usdRate }
}
