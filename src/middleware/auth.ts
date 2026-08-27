import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuthSession()

  if (isAuthenticated.value) return

  const localePath = useLocalePath()

  return navigateTo({
    path: localePath('/auth'),
    query: { redirect: to.fullPath },
  })
})
