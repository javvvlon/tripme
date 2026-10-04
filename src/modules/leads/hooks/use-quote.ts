import { Tour } from '~/search_engine/models/Tour'
import type { ITour } from '~/search_engine/models/Tour'
import { QUOTE_MAX } from '~/modules/leads/helpers/quote'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useQuote = () => {
  const picked = useState<ITour[]>('quote-picked', () => [])
  const leadId = useState<string>('quote-lead', () => '')
  const opened = useState<boolean>('quote-open', () => false)

  const tours = computed(() => picked.value.map(item => new Tour(item)))
  const count = computed(() => picked.value.length)
  const full = computed(() => count.value >= QUOTE_MAX)

  const has = (tour: Tour) => picked.value.some(item => item.id === tour.get('id'))

  const toggle = (tour: Tour) => {
    if (has(tour)) {
      picked.value = picked.value.filter(item => item.id !== tour.get('id'))
      return
    }

    if (full.value) return

    picked.value = [...picked.value, tour.toObject()]
  }

  const clear = () => {
    picked.value = []
    opened.value = false
  }

  return { tours, count, full, has, toggle, clear, leadId, opened }
}
