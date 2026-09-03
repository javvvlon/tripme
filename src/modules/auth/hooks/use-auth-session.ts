import type { User } from '~/modules/auth/models/User'
import { useAuthRepository } from '~/modules/auth/repositories/auth.repository'
import { useAuthStorage } from '~/modules/auth/storage/auth-storage'
import { isExpired } from '~/shared/helpers/jwt'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAuthSession = () => {
  const user = useState<User | null>('auth:user', () => null)

  const { login: loginRequest, logout: logoutRequest, me, refresh: refreshRequest, signup: signupRequest } = useAuthRepository()
  const storage = useAuthStorage()

  const isAuthenticated = computed(() => user.value !== null)

  /**
   * Set when a session that was working stops being accepted, as opposed to
   * someone signing out or never having signed in. The app watches it to get
   * the reader out of the CMS.
   */
  const expired = useState('auth:expired', () => false)

  const nuxtApp = useNuxtApp()

  const resolved = {
    get value(): boolean {
      return (nuxtApp as unknown as { _authResolved?: boolean })._authResolved ?? false
    },
    set value(next: boolean) {
      ;(nuxtApp as unknown as { _authResolved?: boolean })._authResolved = next
    },
  }

  function inFlight<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const store = nuxtApp as unknown as Record<string, Promise<T> | undefined>

    if (!store[key]) {
      store[key] = factory().finally(() => { store[key] = undefined })
    }

    return store[key]!
  }

  const restore = async (force = false): Promise<User | null> => {
    if (resolved.value && !force) return user.value

    if (import.meta.client && user.value && !force) {
      resolved.value = true
      return user.value
    }

    if (!storage.hasSession()) {
      resolved.value = true
      return null
    }

    return inFlight('_authRestore', async () => {
      try {
        user.value = await me()
      }
      catch {
        storage.clear()
        user.value = null
      }
      finally {
        resolved.value = true
      }

      return user.value
    })
  }

  /** The session is over and it was not the reader's doing. */
  const expire = (): void => {
    const had = user.value !== null || storage.hasSession()

    storage.clear()
    user.value = null
    resolved.value = true

    if (had) expired.value = true
  }

  const refresh = async (): Promise<boolean> => {
    if (!storage.getRefreshToken()) {
      expire()

      return false
    }

    return inFlight('_authRefresh', async () => {
      try {
        storage.setTokens(await refreshRequest())
        return true
      }
      catch {
        expire()

        return false
      }
    })
  }

  /**
   * Whether the CMS can be entered right now.
   *
   * The route guard used to ask `isAuthenticated`, which only says whether a
   * user was loaded at some point — after an hour on an open tab that is
   * still true while the token behind it has long stopped working. This asks
   * the tokens, and spends a refresh when the access token has run out.
   */
  const ensure = async (): Promise<boolean> => {
    if (!user.value) return false

    if (!storage.hasSession()) {
      expire()

      return false
    }

    if (!isExpired(storage.getAccessToken())) return true

    return refresh()
  }

  const login = async (email: string, password: string): Promise<User> => {
    expired.value = false
    storage.setTokens(await loginRequest({ email, password }))
    user.value = await me()
    resolved.value = true

    return user.value
  }

  const signup = async (payload: Parameters<typeof signupRequest>[0]): Promise<User> => {
    storage.setTokens(await signupRequest(payload))
    user.value = await me()
    resolved.value = true

    return user.value
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutRequest()
    }
    catch {
    }
    finally {
      storage.clear()
      user.value = null
      resolved.value = true
    }
  }

  return { user, isAuthenticated, expired, restore, refresh, ensure, expire, login, signup, logout }
}
