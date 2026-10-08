import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS } from '~/shared/contracts/pagination'
import type { IPageQuery } from '~/shared/contracts/pagination'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const usePageQuery = () => {
  const route = useRoute()
  const router = useRouter()

  const page = computed(() => Math.max(1, Math.floor(Number(route.query.page)) || 1))

  const perPage = computed(() => {
    const value = Number(route.query.per_page)

    return PER_PAGE_OPTIONS.includes(value as never) ? value : DEFAULT_PER_PAGE
  })

  const pageQuery = computed<IPageQuery>(() => ({ page: page.value, perPage: perPage.value }))

  const write = (next: { page?: number, perPage?: number }, remember = false) => {
    const query = { ...route.query }
    const nextPage = next.page ?? page.value
    const nextSize = next.perPage ?? perPage.value

    if (nextPage > 1) query.page = String(nextPage)
    else delete query.page

    if (nextSize !== DEFAULT_PER_PAGE) query.per_page = String(nextSize)
    else delete query.per_page

    void (remember ? router.push({ query }) : router.replace({ query }))
  }

  const setPage = (value: number) => write({ page: value }, true)

  const setPerPage = (value: number) => write({ page: 1, perPage: value })

  const toFirst = () => {
    if (page.value !== 1) write({ page: 1 })
  }

  return { page, perPage, pageQuery, setPage, setPerPage, toFirst }
}
