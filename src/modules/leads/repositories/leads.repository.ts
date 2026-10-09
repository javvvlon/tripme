import { toE164 } from '~/shared/helpers/phone'
import type {
  ILeadDraft, ILeadEvent, ILeadManualDraft, ILeadRaw, ILeadTrip, IOrderDocument, IOrderEvent, IOrderItemBody, IOrderRaw,
  IStaffMember, LeadSort, LeadStatus, ManagerFilter, OrderStatus, SortDirection,
} from '../contracts/leads'
import type { AnyObject } from '~/shared/contracts/data'
import type { IPageQuery, IPageRaw } from '~/shared/contracts/pagination'

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
  trip: ILeadTrip | null
}

export interface IOrderPatchBody {
  status: OrderStatus
  cancel_reason: string
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
      consent: draft.consent === true,
      locale,
      trip,
    } as AnyObject)
  }

  const all = async (
    query: { q?: string, sort?: LeadSort, dir?: SortDirection, manager?: ManagerFilter } = {},
  ): Promise<ILeadRaw[]> => {
    const params: Record<string, string> = {}

    if (query.q) params.q = query.q
    if (query.sort) params.sort = query.sort
    if (query.dir) params.dir = query.dir
    if (query.manager && query.manager !== 'all') params.manager = query.manager

    const response = await http.call<ILeadRaw[]>('Leads', 'adminLeads', params)

    return response.data
  }

  const page = async (
    query: { q?: string, status?: LeadStatus, sort?: LeadSort, dir?: SortDirection, manager?: ManagerFilter, archived?: boolean },
    paging: IPageQuery,
  ): Promise<IPageRaw<ILeadRaw, { all: number, fresh: number }>> => {
    const params: Record<string, string> = { page: String(paging.page), per_page: String(paging.perPage) }

    if (query.q) params.q = query.q
    if (query.status) params.status = query.status
    if (query.sort) params.sort = query.sort
    if (query.dir) params.dir = query.dir
    if (query.manager && query.manager !== 'all') params.manager = query.manager
    if (query.archived) params.archived = '1'

    const response = await http.call<IPageRaw<ILeadRaw, { all: number, fresh: number }>>('Leads', 'adminLeads', params)

    return response.data
  }

  const one = async (id: string): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'adminLead', { id })

    return response.data
  }

  const history = async (id: string): Promise<ILeadEvent[]> => {
    const response = await http.call<ILeadEvent[]>('Leads', 'leadHistory', { id })

    return response.data ?? []
  }

  const take = async (id: string): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'takeLead', { id })

    return response.data
  }

  const staff = async (): Promise<IStaffMember[]> => {
    const response = await http.call<IStaffMember[]>('Leads', 'staff')

    return response.data ?? []
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

  const archive = async (id: string): Promise<ILeadRaw> => (await http.call<ILeadRaw>('Leads', 'archiveLead', { id })).data

  const restore = async (id: string): Promise<ILeadRaw> => (await http.call<ILeadRaw>('Leads', 'restoreLead', { id })).data

  const orders = async (query: { q?: string, status?: string, manager?: ManagerFilter } = {}): Promise<IOrderRaw[]> => {
    const params: Record<string, string> = {}

    if (query.q) params.q = query.q
    if (query.status) params.status = query.status
    if (query.manager && query.manager !== 'all') params.manager = query.manager

    const response = await http.call<IOrderRaw[]>('Leads', 'orders', params)

    return response.data
  }

  const ordersPage = async (
    query: { q?: string, status?: string, manager?: ManagerFilter, archived?: boolean },
    paging: IPageQuery,
  ): Promise<IPageRaw<IOrderRaw, { all: number, live: number }>> => {
    const params: Record<string, string> = { page: String(paging.page), per_page: String(paging.perPage) }

    if (query.q) params.q = query.q
    if (query.status) params.status = query.status
    if (query.manager && query.manager !== 'all') params.manager = query.manager
    if (query.archived) params.archived = '1'

    const response = await http.call<IPageRaw<IOrderRaw, { all: number, live: number }>>('Leads', 'orders', params)

    return response.data
  }

  const ordersFor = async (leadId: string): Promise<IOrderRaw[]> => {
    const response = await http.call<IOrderRaw[]>('Leads', 'leadOrders', { id: leadId })

    return response.data
  }

  const createOrder = async (
    leadId: string,
    trip: ILeadTrip,
    starting: Record<string, unknown> = {},
  ): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>(
      'Leads',
      'createOrder',
      { id: leadId },
      { trip, ...starting } as AnyObject,
    )

    return response.data
  }

  const orderDocuments = async (id: string): Promise<IOrderDocument[]> => {
    const response = await http.call<IOrderDocument[]>('Leads', 'orderDocuments', { id })

    return response.data ?? []
  }

  const generateDocument = async (id: string, kind: 'offer' | 'invoice'): Promise<IOrderDocument> => {
    const response = await http.call<IOrderDocument>('Leads', 'generateDocument', { id, kind })

    return response.data
  }

  const attachDocument = async (id: string, file: File): Promise<IOrderDocument> => {
    const body = new FormData()

    body.append('file', file, file.name)

    const response = await http.call<IOrderDocument>('Leads', 'attachDocument', { id }, body)

    return response.data
  }

  const uploadContract = async (id: string, file: File): Promise<IOrderRaw> => {
    const body = new FormData()

    body.append('file', file, file.name)

    const response = await http.call<IOrderRaw>('Leads', 'uploadContract', { id }, body)

    return response.data
  }

  const confirmItem = async (id: string, itemId: string, supplierRef: string): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'confirmItem', { id, itemId }, { supplier_ref: supplierRef.trim() } as AnyObject)

    return response.data
  }

  const addItem = async (id: string, body: IOrderItemBody): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'addItem', { id }, body as unknown as AnyObject)

    return response.data
  }

  const updateItem = async (id: string, itemId: string, body: IOrderItemBody): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'updateItem', { id, itemId }, body as unknown as AnyObject)

    return response.data
  }

  const removeItem = async (id: string, itemId: string): Promise<IOrderRaw> => {
    const response = await http.call<IOrderRaw>('Leads', 'removeItem', { id, itemId })

    return response.data
  }

  const issueItem = async (id: string, itemId: string, file: File | null): Promise<IOrderRaw> => {
    const body = new FormData()

    if (file) body.append('file', file, file.name)

    const response = await http.call<IOrderRaw>('Leads', 'issueItem', { id, itemId }, body)

    return response.data
  }

  const removeDocument = async (id: string): Promise<void> => {
    await http.call<void>('Leads', 'removeDocument', { id })
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

  const archiveOrder = async (id: string): Promise<IOrderRaw> => (await http.call<IOrderRaw>('Leads', 'archiveOrder', { id })).data

  const restoreOrder = async (id: string): Promise<IOrderRaw> => (await http.call<IOrderRaw>('Leads', 'restoreOrder', { id })).data

  return {
    submit, all, page, one, history, take, staff, create, patch, setStatus, archive, restore,
    orders, ordersPage, ordersFor, createOrder, order, orderHistory, patchOrder, archiveOrder, restoreOrder,
    orderDocuments, generateDocument, attachDocument, removeDocument, uploadContract, confirmItem,
    addItem, updateItem, removeItem, issueItem,
  }
}
