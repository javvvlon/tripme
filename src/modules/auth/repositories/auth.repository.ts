import { User } from '~/modules/auth/models/User'
import type { IUserRaw } from '~/modules/auth/models/User'
import {
  AuthLoginIntention,
  AuthSignupIntention,
  AuthVerifyIntention,
} from '~/modules/auth/intentions/auth'
import type {
  IAuthLoginData,
  IAuthSignupData,
  IAuthTokens,
  IVerificationData,
} from '~/modules/auth/contracts/auth'
import { useAuthStorage } from '~/modules/auth/storage/auth-storage'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
interface ITokensRaw {
  access_token: string
  refresh_token: string
}

const toTokens = (raw: ITokensRaw): IAuthTokens => ({
  accessToken: raw.access_token,
  refreshToken: raw.refresh_token,
})

export const useAuthRepository = () => {
  const http = useHttp()

  const login = async (payload: IAuthLoginData): Promise<IAuthTokens> => {
    const body = new AuthLoginIntention().toRequest(payload)
    const response = await http.call<ITokensRaw>('Auth', 'login', {}, body as AnyObject)

    return toTokens(response.data)
  }

  const signup = async (payload: IAuthSignupData): Promise<IAuthTokens> => {
    const body = new AuthSignupIntention().toRequest(payload)
    const response = await http.call<ITokensRaw>('Auth', 'signup', {}, body as AnyObject)

    return toTokens(response.data)
  }

  const refresh = async (): Promise<IAuthTokens> => {
    const response = await http.call<ITokensRaw>('Auth', 'refresh')

    return toTokens(response.data)
  }

  const logout = async (): Promise<void> => {
    const refreshToken = useAuthStorage().getRefreshToken()

    await http.call<void>('Auth', 'logout', {}, refreshToken ? { refresh_token: refreshToken } : {})
  }

  const sendVerification = async (email: string): Promise<void> => {
    await http.call<void>('Auth', 'sendVerification', {}, { email })
  }

  const verify = async (payload: IVerificationData): Promise<IAuthTokens> => {
    const body = new AuthVerifyIntention().toRequest(payload)
    const response = await http.call<ITokensRaw>('Auth', 'verify', {}, body as AnyObject)

    return toTokens(response.data)
  }

  const me = async (): Promise<User> => {
    const response = await http.call<IUserRaw>('Auth', 'me')

    return User.fromRaw(response.data)
  }

  return { login, signup, refresh, logout, sendVerification, verify, me }
}
