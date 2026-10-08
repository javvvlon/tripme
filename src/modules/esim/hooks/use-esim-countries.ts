import { useEsimRepository } from '~/modules/esim/repositories'
import type { IEsimCountry } from '~/modules/esim/contracts/esim'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimCountries = () => {
  const { countries } = useEsimRepository()

  return useAsyncData('esim:countries', () => countries().catch((): IEsimCountry[] => []), { default: () => [] as IEsimCountry[] })
}
