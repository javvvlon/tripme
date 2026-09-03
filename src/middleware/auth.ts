import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { ensure, expired } = useAuthSession()
  const localePath = useLocalePath()

  if (await ensure()) return

  /**
   * A session that ran out while the tab sat open is sent home rather than
   * to the sign-in form: the reader did not ask to go anywhere, and landing
   * on a form with a redirect back to a page they can no longer see reads as
   * the app having lost their place.
   *
   * Saying so is the session plugin's job — a route middleware has no setup
   * context, so it cannot reach the translations.
   */
  if (expired.value) return navigateTo(localePath('/'))

  return navigateTo({
    path: localePath('/auth'),
    query: { redirect: to.fullPath },
  })
})
