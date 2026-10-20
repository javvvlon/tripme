import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { MARKETING_ROLES } from '../contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAdvertiser = () => {
  const { user } = useAuthSession()

  const canAdvertise = computed(() => (MARKETING_ROLES as readonly string[]).includes(user.value?.get('role') ?? ''))

  return { canAdvertise }
}
