import { toE164 } from '~/shared/helpers/phone'
import type { ILeadDraft, ILeadManualDraft, ILeadRaw, ILeadTrip, LeadSort, LeadStatus, SortDirection } from '../contracts/leads'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
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
      passport_id: draft.passportId.trim(),
      passport_expires_at: draft.passportExpiresAt || undefined,
      comment: draft.comment.trim(),
      trip,
    } as AnyObject)

    return response.data
  }

  const patch = async (
    id: string,
    body: Partial<{ status: LeadStatus, supplier_order_id: string, comment: string, passport_id: string, passport_expires_at: string | null }>,
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

  return { submit, all, one, create, patch, setStatus, remove }
}
