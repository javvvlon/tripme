import type { IFinanceRaw, IPaymentDraft } from '../contracts/finance'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const digits = (value: string): string => value.replace(/\s/g, '').replace(',', '.')

export const useFinanceRepository = () => {
  const http = useHttp()

  const overview = async (orderId: string): Promise<IFinanceRaw> => {
    const response = await http.call<IFinanceRaw>('Finance', 'overview', { id: orderId })

    return response.data
  }

  const record = async (orderId: string, draft: IPaymentDraft): Promise<IFinanceRaw> => {
    const body = new FormData()

    body.append('direction', draft.direction)
    body.append('amount', String(draft.amount ?? ''))
    body.append('currency', draft.currency)
    body.append('method', draft.method)
    body.append('paid_at', draft.paidAt)
    body.append('note', draft.note.trim())
    if (draft.currency !== 'UZS' && draft.fxRate.trim()) body.append('fx_rate', digits(draft.fxRate))
    if (draft.receipt) body.append('receipt', draft.receipt, draft.receipt.name)

    const response = await http.call<IFinanceRaw>('Finance', 'recordPayment', { id: orderId }, body)

    return response.data
  }

  const reverse = async (paymentId: string, note = ''): Promise<IFinanceRaw> => {
    const response = await http.call<IFinanceRaw>('Finance', 'reversePayment', { id: paymentId }, { note } as AnyObject)

    return response.data
  }

  const setDeposit = async (orderId: string, percent: number | null): Promise<IFinanceRaw> => {
    const response = await http.call<IFinanceRaw>('Finance', 'setDeposit', { id: orderId }, { percent } as AnyObject)

    return response.data
  }

  return { overview, record, reverse, setDeposit }
}
