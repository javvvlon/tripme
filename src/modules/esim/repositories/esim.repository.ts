import type { AnyObject } from '~/shared/contracts/data'
import type { IPageRaw } from '~/shared/contracts/pagination'
import type {
  IEsimCheckout, IEsimCountry, IEsimMethod, IEsimPlan, IEsimPurchase, IEsimPurchaseRow,
} from '../contracts/esim'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimRepository = () => {
  const http = useHttp()

  const countries = async (): Promise<IEsimCountry[]> => (await http.call<IEsimCountry[]>('Esim', 'countries')).data

  const plans = async (code: string): Promise<IEsimPlan[]> =>
    (await http.call<IEsimPlan[]>('Esim', 'plans', { code: code.toLowerCase() })).data

  const methods = async (): Promise<IEsimMethod[]> => (await http.call<IEsimMethod[]>('Esim', 'methods')).data

  const checkout = async (input: IEsimCheckout): Promise<IEsimPurchase> => {
    const body: AnyObject = {
      plan_id: input.planId,
      email: input.email.trim(),
      phone: input.phone,
      method: input.method,
      locale: input.locale,
    }

    return (await http.call<IEsimPurchase>('Esim', 'checkout', {}, body)).data
  }

  const purchase = async (token: string): Promise<IEsimPurchase> =>
    (await http.call<IEsimPurchase>('Esim', 'purchase', { token })).data

  const sandboxPay = async (token: string, outcome: 'paid' | 'failed'): Promise<IEsimPurchase> =>
    (await http.call<IEsimPurchase>('Esim', 'sandboxPay', { token }, { outcome } as AnyObject)).data

  const purchases = async (query: { page: number, per_page: number, status?: string, q?: string }): Promise<IPageRaw<IEsimPurchaseRow>> =>
    (await http.call<IPageRaw<IEsimPurchaseRow>>('Esim', 'purchases', query as AnyObject)).data

  const retry = async (id: string): Promise<IEsimPurchaseRow> =>
    (await http.call<IEsimPurchaseRow>('Esim', 'retry', { id })).data

  return { countries, plans, methods, checkout, purchase, sandboxPay, purchases, retry }
}
