/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITravellersPickerProps {
  label: string
  maxAdults?: number
  maxKids?: number
  variant?: 'panel' | 'bar' | 'field'
}

export interface ITravellers {
  adults: number
  kidAges: number[]
}
