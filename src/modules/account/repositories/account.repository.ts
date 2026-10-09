import { User } from '~/modules/auth/models/User'
import type { IUserRaw } from '~/modules/auth/models/User'
import { toE164 } from '~/shared/helpers/phone'
import type {
  ICustomerEsim, ICustomerOrder, ICustomerOrderDetail, ICustomerRequest, IPasswordDraft, IProfileDraft, ITraveller, ITravellerDraft,
} from '../contracts/account'
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

  const requests = async (): Promise<ICustomerRequest[]> => (await http.call<ICustomerRequest[]>('Account', 'requests')).data

  const esims = async (): Promise<ICustomerEsim[]> => (await http.call<ICustomerEsim[]>('Account', 'esim')).data

  const travellers = async (): Promise<ITraveller[]> => (await http.call<ITraveller[]>('Account', 'travellers')).data

  const saveTraveller = async (draft: ITravellerDraft, id?: string): Promise<ITraveller> => {
    const body = { ...draft } as unknown as AnyObject

    return id
      ? (await http.call<ITraveller>('Account', 'updateTraveller', { id }, body)).data
      : (await http.call<ITraveller>('Account', 'addTraveller', {}, body)).data
  }

  const removeTraveller = async (id: string): Promise<void> => {
    await http.call<void>('Account', 'removeTraveller', { id })
  }

  const sendPhoneCode = async (locale: string): Promise<void> => {
    await http.call<void>('Account', 'sendPhoneCode', {}, { locale } as AnyObject)
  }

  const verifyPhone = async (code: string): Promise<User> =>
    User.fromRaw((await http.call<IUserRaw>('Account', 'verifyPhone', {}, { code: code.trim() } as AnyObject)).data)

  const deleteAccount = async (password: string): Promise<void> => {
    await http.call<void>('Account', 'deleteAccount', {}, { password } as AnyObject)
  }

  const uploadDocument = async (orderId: string, file: File): Promise<void> => {
    const body = new FormData()

    body.append('file', file, file.name)
    await http.call<unknown>('Account', 'uploadDocument', { id: orderId }, body)
  }

  const removeDocument = async (id: string): Promise<void> => {
    await http.call<void>('Account', 'removeDocument', { id })
  }

  return {
    uploadDocument, removeDocument,
    orders, order, updateProfile, changePassword, requests, esims,
    travellers, saveTraveller, removeTraveller, sendPhoneCode, verifyPhone, deleteAccount,
  }
}
