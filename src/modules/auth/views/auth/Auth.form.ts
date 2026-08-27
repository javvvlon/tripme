import type { IAuthLoginData } from '~/modules/auth/contracts/auth'
import { MIN_PASSWORD_LENGTH } from './Auth.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type AuthField = keyof IAuthLoginData

export const useAuthForm = () => {
  const values = reactive<IAuthLoginData>({ email: '', password: '' })

  const validation = useValidation(values, {
    email: [required(), email()],
    password: [required(), minLength(MIN_PASSWORD_LENGTH)],
  })

  const reset = () => {
    values.email = ''
    values.password = ''
    validation.reset()
  }

  return { values, ...validation, reset }
}
