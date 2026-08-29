import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILeadModalProps {
  trip: ILeadTrip
  summary?: string
}
