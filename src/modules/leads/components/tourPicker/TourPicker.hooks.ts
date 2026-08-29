import { useToursRepository } from '~/search_engine/repositories'
import type { Tour } from '~/search_engine/models/Tour'
import { SearchMode, SearchSort } from '~/search_engine/contracts/search'
import type { SearchRequest } from '~/search_engine/contracts/search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTourPicker = () => {
  const { t } = useI18n()
  const { search } = useToursRepository()

  const from = ref('')
  const to = ref('')
  const date = ref('')
  const nights = ref(7)
  const adults = ref(2)
  const kids = ref(0)

  const references = useSearchReferences(from, to)

  const results = shallowRef<Tour[]>([])
  const searching = ref(false)
  const searched = ref(false)
  const error = ref('')

  const canSearch = computed(() => Boolean(from.value && to.value && date.value))

  watch([from, to, date, nights, adults, kids], () => {
    results.value = []
    searched.value = false
  })

  async function run() {
    if (!canSearch.value) return

    searching.value = true
    error.value = ''

    try {
      const request: SearchRequest = {
        mode: SearchMode.Tours,
        from: from.value,
        to: to.value,
        date: date.value,
        nights: nights.value,
        adults: adults.value,
        kids: kids.value,
        filters: {},
        page: 1,
        size: 20,
        sort: SearchSort.PriceAsc,
      }

      results.value = (await search(request)).items
      searched.value = true
    }
    catch {
      error.value = t('cms.leads.picker.failed')
    }
    finally {
      searching.value = false
    }
  }

  return {
    from, to, date, nights, adults, kids,
    references, results, searching, searched, error, canSearch, run,
  }
}
