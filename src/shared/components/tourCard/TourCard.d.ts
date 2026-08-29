import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourCardProps {
  tour: Tour
  eager?: boolean
  agentView?: boolean
  /** search context, forwarded with a request so a lead carries the route */
  route?: { from: string, to: string }
}
