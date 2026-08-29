import { toE164 } from '~/shared/helpers/phone'
import type { ILeadDraft, ILeadManualDraft, ILeadRaw, ILeadTrip, LeadStatus } from '../contracts/leads'
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

  const all = async (status?: LeadStatus | ''): Promise<ILeadRaw[]> => {
    const response = await http.call<ILeadRaw[]>('Leads', 'adminLeads', status ? { status } : {})

    return response.data
  }

  const one = async (id: string): Promise<ILeadRaw> => {
    const response = await http.call<ILeadRaw>('Leads', 'adminLead', { id })

    return response.data
  }

  const create = async (draft: ILeadManualDraft): Promise<ILeadRaw> => {
    const number = (value: string): number | undefined =>
      value.trim() === '' ? undefined : Number(value)

    const response = await http.call<ILeadRaw>('Leads', 'createLead', {}, {
      first_name: draft.firstName.trim(),
      last_name: draft.lastName.trim(),
      phone: toE164(draft.phone),
      comment: draft.comment.trim(),
      trip: {
        hotel_name: draft.hotelName.trim(),
        supplier_name: draft.supplierName.trim(),
        check_in: draft.checkIn || undefined,
        nights: number(draft.nights),
        adults: number(draft.adults),
        children: number(draft.children),
        price_amount: number(draft.priceAmount),
        price_currency: draft.priceCurrency.trim(),
        route_from: draft.routeFrom.trim(),
        route_to: draft.routeTo.trim(),
      },
    } as AnyObject)

    return response.data
  }

  const patch = async (id: string, body: Partial<{ status: LeadStatus, supplier_order_id: string, comment: string }>): Promise<ILeadRaw> => {
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
