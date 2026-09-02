import { toE164 } from '~/shared/helpers/phone'
import type {
  ILeadDraft, ILeadManualDraft, ILeadRaw, ILeadTrip, IOrderEvent, IOrderRaw,
  LeadSort, LeadStatus, OrderStatus, SortDirection,
} from '../contracts/leads'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILeadPatchBody {
  status: LeadStatus
  comment: string
  reject_reason: string
  channel: string
  destination: string
  planned_dates: string
  party_size: number
  budget_amount: number | null
  budget_currency: string
  manager_id: string | null
  first_name: string
  last_name: string
  phone: string
}

export interface IOrderPatchBody {
  status: OrderStatus
  traveller_name: string
  country: string
  hotel_name: string
  supplier_name: string
  supplier_order_id: string
  passport_id: string
  passport_expires_at: string | null
  deal_date: string | null
  check_in: string | null
  return_date: string | null
  nights: number
  adults: number
  children: number
  price_amount: number | null
  price_currency: string
  manager_id: string | null
  branch: string
  note: string
}

export const useLeadsRepository = () => {
  const http = useHttp()

  const submit = async (draft: ILeadDraft, trip: ILeadTrip, locale: string): Promise<void> => {
    await http.call<{ uuid: string }>('Leads', 'submit', {}, {
      first_name: draft.firstName.trim(),
      last_name: draft.lastName.trim(),
      phone: toE164(draft.phone),
      comment: draft.comment.trim(),
      locale,
      trip,
    } as AnyObject)
  }

  const all = async (query: { q?: string, sort?: LeadSort, dir?: SortDirection } = {}): Promise<ILeadRaw[]> => {
    const params: Record<string, string> = {}

    if (query.q) params.q = query.q
    if (query.sort) params.sort = query.sort
    if (query.dir) params.dir = query.dir

    const response = await http.call<ILeadRaw[]>('Leads', 'adminLeads', params)

    return response.data
  }

  const one = async (id: string): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'adminLead', { id })

    return response.data
  }

  const create = async (draft: ILeadManualDraft, trip: ILeadTrip): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'createLead', {}, {
      first_name: draft.firstName.trim(),
      last_name: draft.lastName.trim(),
      phone: toE164(draft.phone),
      comment: draft.comment.trim(),
      trip,
    } as AnyObject)

    return response.data
  }

  const patch = async (
    id: string,
    body: Partial<ILeadPatchBody>,
  ): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'patchLead', { id }, body as AnyObject)

    return response.data
  }

  const setStatus = async (id: string, status: LeadStatus): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'patchLead', { id }, { status })

    return response.data
  }

  const remove = async (id: string): Promise<void> => {
    await http.call<void>('Leads', 'deleteLead', { id })
  }

  const orders = async (query: { q?: string, status?: string } = {}): Promise<IOrderRaw[]> => {
    const params: Record<string, string> = {}

    if (query.q) params.q = query.q
    if (query.status) params.status = query.status

    const response = await http.call<IOrderRaw[]>('Leads', 'orders', params)

    return response.data
  }

  const ordersFor = async (leadId: string): Promise<IOrderRaw[]> => {
    const response = await http.call<IOrderRaw[]>('Leads', 'leadOrders', { id: leadId })

    return response.data
  }

  const createOrder = async (leadId: string, trip: ILeadTrip): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'createOrder', { id: leadId }, { trip } as AnyObject)

    return response.data
  }

  const order = async (id: string): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'order', { id })

    return response.data
  }

  const orderHistory = async (id: string): Promise<IOrderEvent[]> => {
    const response = await http.call<IOrderEvent[]>('Leads', 'orderHistory', { id })

    return response.data
  }

  const patchOrder = async (
    id: string,
    body: Partial<IOrderPatchBody>,
  ): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'patchOrder', { id }, body as AnyObject)

    return response.data
  }

  const removeOrder = async (id: string): Promise<void> => {
    await http.call<void>('Leads', 'deleteOrder', { id })
  }

  return {
    submit, all, one, create, patch, setStatus, remove,
    orders, ordersFor, createOrder, order, orderHistory, patchOrder, removeOrder,
  }
}
