import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourOfferProps {
  trip: ILeadTrip
  heading?: string
  actionable?: boolean
}
