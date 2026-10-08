import type { ITripRoute } from '~/modules/leads/contracts/leads'
import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourPickerCriteria {
  from: string
  to: string
  date: string
  nights: number
  adults: number
  kids: number
}

export interface ITourPickerProps {
  selected: Tour | null
  initial?: Partial<ITourPickerCriteria>
}

export interface ITourPickerEmits {
  'update:selected': [tour: Tour | null, route: ITripRoute | null]
}
