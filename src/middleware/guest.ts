import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuthSession()

  if (!user.value) return

  return navigateTo(useLocalePath()(user.value.homePath()))
})
