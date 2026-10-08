import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { countryName, flagOf, sumOf } from '~/modules/esim/helpers/esim'
import { POPULAR_ESIM_COUNTRIES } from '~/modules/esim/contracts/esim'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimSearch = () => {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const { data, status } = useEsimCountries()

  const country = ref('')

  const options = computed(() => [...data.value]
    .map(entry => ({
      value: entry.code,
      label: `${flagOf(entry.code)}  ${countryName(entry.code, locale.value)}`,
      hint: t('esim.from', { price: sumOf(entry.from_uzs, locale.value, t('esim.sum')) }),
      group: POPULAR_ESIM_COUNTRIES.includes(entry.code) ? t('esim.popular') : t('esim.allCountries'),
      popular: POPULAR_ESIM_COUNTRIES.indexOf(entry.code),
    }))
    .sort((a, b) => {
      if (a.popular !== b.popular) return (a.popular === -1 ? 99 : a.popular) - (b.popular === -1 ? 99 : b.popular)

      return a.label.localeCompare(b.label, locale.value)
    })
    .map(({ popular: _, ...option }) => option))

  const popular = computed(() => POPULAR_ESIM_COUNTRIES.map(code => ({
    code,
    label: `${flagOf(code)}  ${countryName(code, locale.value)}`,
    to: `/esim/${code.toLowerCase()}`,
  })))

  function submit() {
    void navigateTo(localePath(country.value ? `/esim/${country.value.toLowerCase()}` : '/esim'))
  }

  return { country, options, popular, loading: computed(() => status.value === 'pending'), submit }
}
