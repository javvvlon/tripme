import { useReferencesRepository } from '~/search_engine/repositories/references.repository'
import type { IReferenceItem } from '~/search_engine/contracts/references'
import type { ProductMode } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useProductCountries = (mode: ProductMode) => {
  const { fetchCountries } = useReferencesRepository()

  return useAsyncData(
    `references:countries:${mode}`,
    () => fetchCountries(undefined, mode).then(answer => answer.items).catch((): IReferenceItem[] => []),
    { server: false, default: () => [] as IReferenceItem[] },
  )
}
