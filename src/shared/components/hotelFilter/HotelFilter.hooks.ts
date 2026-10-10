import { useHotelsRepository } from '~/search_engine/repositories/hotels.repository'
import { useHotelLabels } from '~/shared/composables/useHotelLabels'
import type { IHotelSuggestion } from '~/search_engine/contracts/search'
import type { IHotelFilterEmits, IHotelFilterProps } from './HotelFilter.d'
import { HOTEL_DEBOUNCE_MS, HOTEL_QUERY_MIN } from './HotelFilter.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useHotelFilter = (props: IHotelFilterProps, emit: (event: 'toggle', key: string) => void) => {
  const { suggest } = useHotelsRepository()
  const { remember, labelOf } = useHotelLabels()

  const query = ref('')
  const open = ref(false)
  const loading = ref(false)
  const results = ref<IHotelSuggestion[]>([])
  const active = ref(0)

  let controller: AbortController | null = null
  let warmed = ''

  const route = computed(() => `${props.from}:${props.to}`)

  const ready = computed(() => query.value.trim().length >= HOTEL_QUERY_MIN)

  const lookup = debounce(async (needle: string) => {
    controller?.abort()
    controller = new AbortController()
    loading.value = true

    try {
      const found = await suggest(props.from, props.to, needle, controller.signal)

      if (needle !== query.value.trim()) return

      for (const hotel of found) remember(hotel.key, hotel.name)

      results.value = found
      active.value = 0
    }
    catch {
      if (!controller?.signal.aborted) results.value = []
    }
    finally {
      if (needle === query.value.trim()) loading.value = false
    }
  }, HOTEL_DEBOUNCE_MS)

  watch(query, (value) => {
    const needle = value.trim()

    open.value = true

    if (needle.length < HOTEL_QUERY_MIN) {
      lookup.cancel()
      controller?.abort()
      results.value = []
      loading.value = false

      return
    }

    loading.value = true
    lookup(needle)
  })

  watch(route, () => {
    query.value = ''
    results.value = []
  })

  function warm() {
    if (warmed === route.value || !props.from || !props.to) return

    warmed = route.value
    void suggest(props.from, props.to, '').catch(() => [])
  }

  function focus() {
    warm()
    open.value = true
  }

  function pick(hotel: IHotelSuggestion | undefined) {
    if (!hotel) return

    remember(hotel.key, hotel.name)
    emit('toggle', hotel.key)
    query.value = ''
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      if (!results.value.length) return

      const step = event.key === 'ArrowDown' ? 1 : -1

      active.value = (active.value + step + results.value.length) % results.value.length
    }
    else if (event.key === 'Enter') {
      event.preventDefault()
      pick(results.value[active.value])
    }
    else if (event.key === 'Escape') {
      open.value = false
    }
  }

  onBeforeUnmount(() => {
    lookup.cancel()
    controller?.abort()
  })

  return { query, open, loading, results, active, ready, labelOf, focus, pick, onKey }
}
