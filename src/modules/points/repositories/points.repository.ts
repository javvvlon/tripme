import { asAmount, asCount } from '~/shared/helpers/numbers'
import type {
  ICustomerPoints, IMyPoints, IPointsOverview, IPointsTier, IPointsTierDraft, PointsRates,
} from '../contracts/points'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const tierBody = (draft: IPointsTierDraft): AnyObject => ({
  name: draft.name.trim(),
  threshold: asCount(draft.threshold),
  discount_percent: asAmount(draft.discount_percent) ?? 0,
})

export const usePointsRepository = () => {
  const http = useHttp()

  const overview = async (): Promise<IPointsOverview> => {
    const response = await http.call<IPointsOverview>('Points', 'overview')

    return response.data
  }

  const saveRates = async (rates: Partial<PointsRates>): Promise<PointsRates> => {
    const response = await http.call<PointsRates>('Points', 'rates', {}, rates as AnyObject)

    return response.data
  }

  const createTier = async (draft: IPointsTierDraft): Promise<IPointsTier> => {
    const response = await http.call<IPointsTier>('Points', 'createTier', {}, tierBody(draft))

    return response.data
  }

  const patchTier = async (id: string, draft: IPointsTierDraft): Promise<IPointsTier> => {
    const response = await http.call<IPointsTier>('Points', 'patchTier', { id }, tierBody(draft))

    return response.data
  }

  const removeTier = async (id: string): Promise<void> => {
    await http.call<void>('Points', 'removeTier', { id })
  }

  const customer = async (id: string): Promise<ICustomerPoints> => {
    const response = await http.call<ICustomerPoints>('Points', 'customer', { id })

    return response.data
  }

  const adjust = async (id: string, delta: number, note: string): Promise<ICustomerPoints> => {
    const response = await http.call<ICustomerPoints>('Points', 'adjust', { id }, { delta, note } as AnyObject)

    return response.data
  }

  const mine = async (): Promise<IMyPoints> => {
    const response = await http.call<IMyPoints>('Points', 'mine')

    return response.data
  }

  return { overview, saveRates, createTier, patchTier, removeTier, customer, adjust, mine }
}
