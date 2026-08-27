import { useReferencesRepository } from '~/search_engine/repositories/references.repository'
import type { IReferenceItem } from '~/search_engine/contracts/references'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useDepartures = () => {
  const { fetchDepartures } = useReferencesRepository()
  const unavailable = useState('references-unavailable', () => false)

  const { data: departures } = useAsyncData<IReferenceItem[]>(
    'references-departures',
    () => fetchDepartures().catch(() => {
      unavailable.value = true
      return []
    }),
    { default: () => [] },
  )

  return { departures, unavailable }
}
