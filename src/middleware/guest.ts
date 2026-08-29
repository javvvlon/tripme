import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuthSession()

  if (!isAuthenticated.value) return

  return navigateTo(useLocalePath()('/app/leads'))
})
