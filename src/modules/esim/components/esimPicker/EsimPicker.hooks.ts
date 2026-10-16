import { useEsimRepository } from '~/modules/esim/repositories'
import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { countryName, flagOf, sumOf } from '~/modules/esim/helpers/esim'
import { esimTrip } from '~/modules/esim/helpers/trip'
import type { IEsimMode, IEsimPlan } from '~/modules/esim/contracts/esim'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimPicker = (initial: () => string | undefined) => {
  const { t, locale } = useI18n()
  const { plans, mode } = useEsimRepository()
  const { data: countries } = useEsimCountries()
  const { data: setup } = useAsyncData('esim:mode', () => mode(), { default: (): IEsimMode => ({ mode: 'checkout', provider: null }) })

  const country = ref('')

  watch(countries, (list) => {
    if (country.value) return

    const wanted = (initial() ?? '').toUpperCase()

    if (wanted && list.some(entry => entry.code === wanted)) country.value = wanted
  }, { immediate: true })

  const sum = (value: number) => sumOf(value, locale.value, t('esim.sum'))

  const countryOptions = computed(() => countries.value
    .map(entry => ({
      value: entry.code,
      label: `${flagOf(entry.code)} ${countryName(entry.code, locale.value)}`,
      hint: t('cms.leads.esim.from', { price: sum(entry.from_uzs) }),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale.value)))

  const { data: found, status } = useAsyncData(
    () => `esim:picker:${country.value}`,
    () => (country.value ? plans(country.value) : Promise.resolve([] as IEsimPlan[])),
    { default: () => [] as IEsimPlan[], watch: [country] },
  )

  const volume = (plan: IEsimPlan) => (plan.data_gb === null ? t('esim.unlimited') : t('esim.gb', { n: plan.data_gb }))

  const cards = computed(() => found.value.map(plan => ({
    plan,
    volume: volume(plan),
    period: t('esim.days', { n: plan.days }, plan.days),
    price: sum(plan.price_uzs),
  })))

  const tripOf = (card: typeof cards.value[number]): ILeadTrip => esimTrip({
    code: country.value,
    name: countryName(country.value, locale.value),
    provider: setup.value.provider,
    plan: card.plan,
    volume: card.volume,
    period: card.period,
  })

  return { country, countryOptions, cards, status, tripOf }
}
