import { Tour } from '~/search_engine/models/Tour'
import type { ITour } from '~/search_engine/models/Tour'
import { QUOTE_MAX } from '~/modules/leads/helpers/quote'
import { tripFromTour } from '~/modules/leads/helpers/trip'
import { useAdvertiser } from '~/modules/marketing/hooks/use-advertiser'
import { PICK_MAX } from '~/modules/marketing/contracts/marketing'
import type { ILeadTrip, ITripRoute } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useQuote = () => {
  const picked = useState<ITour[]>('quote-picked', () => [])
  const routes = useState<Record<string, ITripRoute>>('quote-routes', () => ({}))
  const leadId = useState<string>('quote-lead', () => '')
  const opened = useState<boolean>('quote-open', () => false)
  const { canAdvertise } = useAdvertiser()

  const tours = computed(() => picked.value.map(item => new Tour(item)))
  const count = computed(() => picked.value.length)
  const max = computed(() => (canAdvertise.value ? PICK_MAX : QUOTE_MAX))
  const full = computed(() => count.value >= max.value)
  const quotable = computed(() => count.value > 0 && count.value <= QUOTE_MAX)

  const has = (tour: Tour) => picked.value.some(item => item.id === tour.get('id'))

  const toggle = (tour: Tour, route?: ITripRoute) => {
    const id = tour.get('id')

    if (has(tour)) {
      picked.value = picked.value.filter(item => item.id !== id)

      const rest = { ...routes.value }

      delete rest[id]
      routes.value = rest

      return
    }

    if (full.value) return

    picked.value = [...picked.value, tour.toObject()]

    if (route) routes.value = { ...routes.value, [id]: route }
  }

  const trips = (): ILeadTrip[] => tours.value.map(tour => tripFromTour(tour, routes.value[tour.get('id')]))

  const clear = () => {
    picked.value = []
    routes.value = {}
    opened.value = false
  }

  return { tours, count, max, full, quotable, has, toggle, trips, clear, leadId, opened }
}
