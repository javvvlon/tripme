import type { IAuthTokens } from '~/modules/auth/contracts/auth'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ACCESS_TOKEN_KEY = 'tm_access_token'
export const REFRESH_TOKEN_KEY = 'tm_refresh_token'

const ACCESS_MAX_AGE = 60 * 60 * 24
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

const cookieOptions = (maxAge: number) => ({
  maxAge,
  path: '/',
  sameSite: 'lax' as const,
  secure: !import.meta.dev,
})

const createAuthStorage = () => {
  const access = useCookie<string | null>(ACCESS_TOKEN_KEY, cookieOptions(ACCESS_MAX_AGE))
  const refresh = useCookie<string | null>(REFRESH_TOKEN_KEY, cookieOptions(REFRESH_MAX_AGE))

  const setTokens = (tokens: IAuthTokens) => {
    access.value = tokens.accessToken
    refresh.value = tokens.refreshToken
  }

  const getTokens = (): IAuthTokens | null => {
    if (!access.value || !refresh.value) return null

    return { accessToken: access.value, refreshToken: refresh.value }
  }

  const getAccessToken = () => access.value ?? null
  const getRefreshToken = () => refresh.value ?? null

  const clear = () => {
    access.value = null
    refresh.value = null
  }

  const hasSession = () => Boolean(access.value || refresh.value)

  return { setTokens, getTokens, getAccessToken, getRefreshToken, clear, hasSession }
}

type AuthStorage = ReturnType<typeof createAuthStorage>

export const useAuthStorage = (): AuthStorage => {
  const nuxtApp = useNuxtApp() as unknown as { _authStorage?: AuthStorage }

  return (nuxtApp._authStorage ??= createAuthStorage())
}
