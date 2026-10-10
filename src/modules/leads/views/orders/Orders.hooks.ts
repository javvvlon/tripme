import { useLeadsRepository } from '~/modules/leads/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { ORDER_STATUSES } from '~/modules/leads/contracts/leads'
import type { IOrderRaw, ManagerFilter } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOrders = () => {
  const { t } = useI18n()
  const { ordersPage } = useLeadsRepository()
  const { managerFilter, elevated, me, people } = useManagers('orders')
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

  const route = useRoute()
  const archived = computed(() => route.query.archived === '1')

  watch([debounced, filter, managerFilter, archived], toFirst)

  const { data, status, refresh } = useAsyncData(
    'cms:orders',
    () => ordersPage({ q: debounced.value, status: filter.value, manager: managerFilter.value, archived: archived.value }, pageQuery.value),
    { default: () => null, watch: [debounced, filter, managerFilter, archived, pageQuery] },
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

  const TABS = ['me', 'all', 'none'] as const

  const tab = computed({
    get: () => (TABS as readonly string[]).includes(managerFilter.value) ? managerFilter.value : 'all',
    set: (value: string) => { managerFilter.value = value as ManagerFilter },
  })

  const tabs = computed(() => [
    { value: 'me', label: t('cms.orders.queues.mine'), count: data.value?.counts.mine ?? 0 },
    { value: 'all', label: t(elevated.value ? 'cms.orders.queues.all' : 'cms.orders.queues.allMine'), count: data.value?.counts.all ?? 0 },
    ...(elevated.value ? [{ value: 'none', label: t('cms.orders.queues.none'), count: data.value?.counts.free ?? 0, attention: true }] : []),
  ])

  const person = computed({
    get: () => (TABS as readonly string[]).includes(managerFilter.value) ? '' : managerFilter.value,
    set: (value: string) => { managerFilter.value = (value || 'all') as ManagerFilter },
  })

  const personOptions = computed(() => [
    { value: '', label: t('cms.ownership.filter.anyone') },
    ...(people.value ?? []).filter(member => member.uuid !== me.value).map(member => ({ value: member.uuid, label: member.name })),
  ])

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    orders, status, error, query, filter, filterOptions, counts, refresh, archived,
    elevated, me, tab, tabs, person, personOptions,
    page, pages, total, perPage, setPage, setPerPage,
  }
}
