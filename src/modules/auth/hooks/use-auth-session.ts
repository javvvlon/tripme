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
  const isStaff = computed(() => user.value?.canAccessWorkspace() ?? false)
  const isClient = computed(() => user.value?.isClient() ?? false)

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
      catch (error) {
        const status = (error as { status?: number }).status

        if (status === 401 || status === 403) storage.clear()

        user.value = null
      }
      finally {
        resolved.value = true
      }

      return user.value
    })
  }

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

  return { user, isAuthenticated, isStaff, isClient, expired, restore, refresh, ensure, expire, login, signup, logout }
}
