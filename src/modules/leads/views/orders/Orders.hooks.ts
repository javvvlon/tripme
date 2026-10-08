import { useLeadsRepository } from '~/modules/leads/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { ORDER_STATUSES } from '~/modules/leads/contracts/leads'
import type { IOrderRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOrders = () => {
  const { t } = useI18n()
  const { ordersPage } = useLeadsRepository()
  const { managerFilter, filterOptions: managerOptions, me } = useManagers('orders')
  const { page, perPage, pageQuery, setPage, setPerPage, toFirst } = usePageQuery()

  const query = ref('')
  const filter = ref('')
  const error = ref('')

  const debounced = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (next) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => { debounced.value = next.trim() }, 300)
  })

  watch([debounced, filter, managerFilter], toFirst)

  const { data, status, refresh } = useAsyncData(
    'cms:orders',
    () => ordersPage({ q: debounced.value, status: filter.value, manager: managerFilter.value }, pageQuery.value),
    { default: () => null, watch: [debounced, filter, managerFilter, pageQuery] },
  )

  const orders = computed<IOrderRaw[]>(() => data.value?.items ?? [])
  const pages = computed(() => data.value?.pages ?? 1)
  const total = computed(() => data.value?.total ?? 0)

  watch(data, (next) => {
    if (next && !next.items.length && next.page > next.pages) setPage(next.pages)
  })

  const filterOptions = computed(() => [
    { value: '', label: t('cms.orders.filters.all') },
    ...ORDER_STATUSES.map(value => ({ value, label: t(`cms.orders.status.${value}`) })),
  ])

  const counts = computed(() => ({
    total: data.value?.counts.all ?? 0,
    live: data.value?.counts.live ?? 0,
  }))

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    orders, status, error, query, filter, filterOptions, counts, refresh,
    managerFilter, managerOptions, me,
    page, pages, total, perPage, setPage, setPerPage,
  }
}
