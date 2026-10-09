import { useAccountRepository } from '~/modules/account/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useCustomerOrders = () => {
  const { t } = useI18n()
  const { loadFailed } = useToast()
  const { orders: fetchOrders, requests: fetchRequests } = useAccountRepository()

  const { data, status, error, refresh } = useAsyncData('account:orders', () => fetchOrders(), { default: () => [] })

  const { data: requestData } = useAsyncData('account:requests', () => fetchRequests().catch(() => []), { default: () => [] })

  const requests = computed(() => (requestData.value ?? []).filter(request => !request.orders && request.status !== 'rejected'))

  watch(error, (failure) => {
    if (failure) loadFailed(t('account.orders.loadFailed'))
  })

  const orders = computed(() => data.value ?? [])

  return { orders, requests, status, refresh }
}
