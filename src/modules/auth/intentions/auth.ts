import { Intention } from '~/shared/helpers/intentions'
import type { IAuthLoginData, IAuthSignupData, IVerificationData } from '~/modules/auth/contracts/auth'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class AuthLoginIntention extends Intention<IAuthLoginData> {
  protected map = {
    email: 'email',
    password: 'password',
  } as const
}

export class AuthSignupIntention extends Intention<IAuthSignupData> {
  protected map = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    phoneNumber: 'phone_number',
    password: 'password',
  } as const
}

export class AuthVerifyIntention extends Intention<IVerificationData> {
  protected map = {
    code: 'code',
    email: 'email',
  } as const
}
