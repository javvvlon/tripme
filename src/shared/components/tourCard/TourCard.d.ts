import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourCardProps {
  tour: Tour
  agentView?: boolean
  route?: { from: string, to: string }
}
