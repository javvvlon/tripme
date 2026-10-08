import { useToursRepository } from '~/search_engine/repositories'
import type { Tour } from '~/search_engine/models/Tour'
import { SearchMode, SearchSort } from '~/search_engine/contracts/search'
import type { SearchRequest } from '~/search_engine/contracts/search'
import { DEFAULT_KID_AGE, HOME_DEPARTURE } from '~/shared/composables/useSearchCriteria'
import type { ITripRoute } from '~/modules/leads/contracts/leads'
import type { ITourPickerCriteria } from './TourPicker.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTourPicker = (initial: Partial<ITourPickerCriteria> = {}) => {
  const { t } = useI18n()
  const { search } = useToursRepository()

  const from = ref(initial.from || HOME_DEPARTURE)
  const to = ref(initial.to ?? '')
  const date = ref(initial.date ?? '')
  const nights = ref(initial.nights || 7)
  const adults = ref(initial.adults || 2)
  const kids = ref(initial.kids ?? 0)

  const references = useSearchReferences(from, to)

  const route = (): ITripRoute => ({
    from: from.value,
    to: to.value,
    kidAges: Array.from({ length: kids.value }, () => DEFAULT_KID_AGE),
  })

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
        kidAges: Array.from({ length: kids.value }, () => DEFAULT_KID_AGE),
        dateTo: '',
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

  const normalise = (value: string) => value.trim().toLocaleLowerCase()

  let resolved = !to.value

  watch(references.countryOptions, (options) => {
    if (resolved || !options.length) return

    resolved = true

    if (!options.some(option => option.value === to.value)) {
      const wanted = normalise(to.value)
      const match = options.find(option => normalise(option.label) === wanted)
        ?? options.find(option => normalise(option.label).includes(wanted) || wanted.includes(normalise(option.label)))

      to.value = match?.value ?? ''
    }

    if (canSearch.value) void run()
  }, { immediate: true })

  return {
    from, to, date, nights, adults, kids,
    references, results, searching, searched, error, canSearch, run, route,
  }
}
