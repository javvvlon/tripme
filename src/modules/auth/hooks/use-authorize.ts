import type { IAuthTokens } from '~/modules/auth/contracts/auth'
import { useAuthStorage } from '~/modules/auth/storage/auth-storage'
import { useAuthSession } from './use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAuthorize = () => {
  const storage = useAuthStorage()
  const { restore } = useAuthSession()
  const localePath = useLocalePath()
  const route = useRoute()

  return async (tokens: IAuthTokens, fallback = '/app/leads') => {
    storage.setTokens(tokens)
    await restore(true)

    const requested = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const target = requested.startsWith('/') && !requested.startsWith('//') ? requested : fallback

    return navigateTo(localePath(target))
  }
}
