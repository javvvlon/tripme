import type { Tour } from '~/search_engine/models/Tour'
import type { ILeadTrip, ITripRoute } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourCardProps {
  tour: Tour
  agentView?: boolean
  route?: ITripRoute
  assignLabel?: string
  assignTitle?: string
  assigning?: boolean
}

export interface ITourCardEmits {
  assign: [trip: ILeadTrip]
}
