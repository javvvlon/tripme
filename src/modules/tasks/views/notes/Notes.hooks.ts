import { useNotesRepository } from '~/modules/tasks/repositories'
import type { INote, NoteFilter } from '~/modules/tasks/contracts/notes'

const SEARCH_DELAY_MS = 300

const FILTERS: NoteFilter[] = ['all', 'note', 'decision', 'directive', 'archive']

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useNotes = () => {
  const route = useRoute()
  const router = useRouter()
  const { list } = useNotesRepository()

  const filter = computed<NoteFilter>({
    get: () => {
      const value = String(route.query.kind ?? '')

      return FILTERS.includes(value as NoteFilter) ? value as NoteFilter : 'all'
    },
    set: (value) => { void router.replace({ query: { ...route.query, kind: value === 'all' ? undefined : value } }) },
  })

  const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
  const search = ref(query.value)

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (value) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { search.value = value.trim() }, SEARCH_DELAY_MS)
  })

  const { data: notes, status } = useAsyncData(
    'notes:list',
    () => list(filter.value, search.value),
    { default: () => [] as INote[], watch: [filter, search] },
  )

  return { FILTERS, filter, query, search, notes, status }
}
