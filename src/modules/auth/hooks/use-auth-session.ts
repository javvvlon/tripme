import type { User } from '~/modules/auth/models/User'
import { useAuthRepository } from '~/modules/auth/repositories/auth.repository'
import { useAuthStorage } from '~/modules/auth/storage/auth-storage'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAuthSession = () => {
  const user = useState<User | null>('auth:user', () => null)

  const { login: loginRequest, logout: logoutRequest, me, refresh: refreshRequest, signup: signupRequest } = useAuthRepository()
  const storage = useAuthStorage()

  const isAuthenticated = computed(() => user.value !== null)

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

  const refresh = async (): Promise<boolean> => {
    if (!storage.getRefreshToken()) return false

    return inFlight('_authRefresh', async () => {
      try {
        storage.setTokens(await refreshRequest())
        return true
      }
      catch {
        storage.clear()
        user.value = null
        resolved.value = true
        return false
      }
    })
  }

  const login = async (email: string, password: string): Promise<User> => {
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

  return { user, isAuthenticated, restore, refresh, login, signup, logout }
}
