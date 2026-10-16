import type { IEsimPlan } from '~/modules/esim/contracts/esim'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IEsimTripInput {
  code: string
  name: string
  provider: string | null
  plan: IEsimPlan
  volume: string
  period: string
}

export const esimTitle = (name: string, volume: string, period: string): string => `eSIM ${name} · ${volume} · ${period}`

export const esimTrip = (input: IEsimTripInput): ILeadTrip => ({
  product: 'esim',
  hotel_name: esimTitle(input.name, input.volume, input.period),
  supplier_name: input.provider ?? '',
  room_name: input.plan.networks.join(', '),
  check_in: null,
  nights: 0,
  adults: 1,
  children: 0,
  price_amount: input.plan.price_uzs,
  price_currency: 'UZS',
  route_from: '',
  route_to: input.name,
  esim_country: input.code.toUpperCase(),
  esim_plan_id: input.plan.id,
  esim_data_gb: input.plan.data_gb,
  esim_days: input.plan.days,
})
