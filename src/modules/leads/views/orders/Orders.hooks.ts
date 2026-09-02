import { useLeadsRepository } from '~/modules/leads/repositories'
import { ORDER_STATUSES } from '~/modules/leads/contracts/leads'
import type { IOrderRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOrders = () => {
  const { t } = useI18n()
  const { orders: all } = useLeadsRepository()

  const query = ref('')
  const filter = ref('')
  const error = ref('')

  const debounced = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (next) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => { debounced.value = next.trim() }, 300)
  })

  const { data, status, refresh } = useAsyncData(
    'cms:orders',
    () => all({ q: debounced.value, status: filter.value }),
    { default: () => [] as IOrderRaw[], watch: [debounced, filter] },
  )

  const filterOptions = computed(() => [
    { value: '', label: t('cms.orders.filters.all') },
    ...ORDER_STATUSES.map(value => ({ value, label: t(`cms.orders.status.${value}`) })),
  ])

  const counts = computed(() => {
    const rows = data.value ?? []

    return {
      total: rows.length,
      live: rows.filter(row => row.status !== 'completed').length,
    }
  })

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { orders: data, status, error, query, filter, filterOptions, counts, refresh }
}
