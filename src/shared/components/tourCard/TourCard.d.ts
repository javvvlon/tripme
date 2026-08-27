import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourCardProps {
  tour: Tour
  eager?: boolean
  agentView?: boolean
}
