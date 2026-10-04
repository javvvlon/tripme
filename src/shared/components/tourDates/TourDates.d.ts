import type { ICalendarMask } from '~/search_engine/contracts/references'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITourDatesProps {
  label: string
  placeholder?: string
  calendar?: ICalendarMask | null
  nightsOptions: readonly number[]
  variant?: 'panel' | 'bar'
  disabled?: boolean
}

export interface ITourDates {
  date: string
  dateTo: string
  nights: number
}

export interface ICalendarDay {
  iso: string
  day: number
  disabled: boolean
}

export interface ICalendarMonth {
  iso: string
  label: string
  blanks: number
  days: ICalendarDay[]
}
