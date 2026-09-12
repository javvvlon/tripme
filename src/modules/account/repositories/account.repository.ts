import { User } from '~/modules/auth/models/User'
import type { IUserRaw } from '~/modules/auth/models/User'
import { toE164 } from '~/shared/helpers/phone'
import type { ICustomerOrder, ICustomerOrderDetail, IPasswordDraft, IProfileDraft } from '../contracts/account'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAccountRepository = () => {
  const http = useHttp()

  const orders = async (): Promise<ICustomerOrder[]> => {
    const response = await http.call<ICustomerOrder[]>('Account', 'orders')

    return response.data
  }

  const order = async (id: string): Promise<ICustomerOrderDetail> => {
    const response = await http.call<ICustomerOrderDetail>('Account', 'order', { id })

    return response.data
  }

  const updateProfile = async (draft: IProfileDraft): Promise<User> => {
    const response = await http.call<IUserRaw>('Account', 'updateProfile', {}, {
      first_name: draft.firstName.trim(),
      last_name: draft.lastName.trim(),
      phone_number: toE164(draft.phone),
    } as AnyObject)

    return User.fromRaw(response.data)
  }

  const changePassword = async (draft: IPasswordDraft): Promise<void> => {
    await http.call<void>('Account', 'changePassword', {}, {
      current_password: draft.current,
      new_password: draft.next,
    } as AnyObject)
  }

  return { orders, order, updateProfile, changePassword }
}
