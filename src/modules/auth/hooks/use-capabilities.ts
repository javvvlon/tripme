import { useAuthRepository } from '~/modules/auth/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useCapabilities = () => {
  const { capabilities } = useAuthRepository()

  const { data } = useAsyncData('auth:capabilities', () => capabilities().catch(() => ({ email: false, sms: false })), {
    default: () => ({ email: false, sms: false }),
    server: false,
  })

  return { email: computed(() => data.value.email), sms: computed(() => data.value.sms) }
}
