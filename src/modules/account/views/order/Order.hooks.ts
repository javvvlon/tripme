import { useAccountRepository } from '~/modules/account/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useCustomerOrder = () => {
  const { t } = useI18n()
  const { loadFailed } = useToast()
  const route = useRoute()
  const { order: fetchOrder } = useAccountRepository()

  const id = computed(() => String(route.params.id ?? ''))

  const { data: order, status, error } = useAsyncData(
    () => `account:order:${id.value}`,
    () => fetchOrder(id.value),
  )

  const missing = computed(() => {
    const failure = error.value as { status?: number, statusCode?: number } | null

    return failure?.status === 404 || failure?.statusCode === 404
  })

  watch(error, (failure) => {
    if (failure && !missing.value) loadFailed(t('account.order.loadFailed'))
  })

  const history = computed(() => [...(order.value?.history ?? [])].reverse())

  return { order, status, missing, history }
}
