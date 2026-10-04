import { isCompletePhone } from '~/shared/helpers/phone'
import { MIN_PASSWORD_LENGTH } from '../auth/Auth.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IRegisterValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirm: string
  consent: boolean
}

export const useRegisterForm = () => {
  const values = reactive<IRegisterValues>({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '', consent: false,
  })

  const validation = useValidation(values, {
    firstName: [required()],
    lastName: [required()],
    email: [required(), email()],
    phone: [required(), custom<string, IRegisterValues>(value => isCompletePhone(value), 'validation.phone')],
    password: [required(), minLength(MIN_PASSWORD_LENGTH)],
    confirm: [required(), sameAs<IRegisterValues>('password')],
    consent: [custom<boolean, IRegisterValues>(value => value === true, 'validation.consent')],
  })

  return { values, ...validation }
}
