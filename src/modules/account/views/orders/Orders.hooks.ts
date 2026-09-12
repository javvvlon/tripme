import { useAccountRepository } from '~/modules/account/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useCustomerOrders = () => {
  const { t } = useI18n()
  const { loadFailed } = useToast()
  const { orders: fetchOrders } = useAccountRepository()

  const { data, status, error, refresh } = useAsyncData('account:orders', () => fetchOrders(), { default: () => [] })

  watch(error, (failure) => {
    if (failure) loadFailed(t('account.orders.loadFailed'))
  })

  const orders = computed(() => data.value ?? [])

  return { orders, status, refresh }
}
