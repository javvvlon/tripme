import type { ICalendarMask } from '~/search_engine/contracts/references'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDatePickerProps {
  label: string
  placeholder?: string
  calendar?: ICalendarMask | null
  variant?: 'panel' | 'bar'
  disabled?: boolean
}
