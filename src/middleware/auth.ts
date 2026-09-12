import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { ensure, expired } = useAuthSession()
  const localePath = useLocalePath()

  if (await ensure()) return

  if (expired.value) return navigateTo(localePath('/'))

  return navigateTo({
    path: localePath('/auth'),
    query: { redirect: to.fullPath },
  })
})
