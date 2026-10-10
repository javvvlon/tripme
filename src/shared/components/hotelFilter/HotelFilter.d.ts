/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IHotelFilterProps {
  from: string
  to: string
  selected: string[]
}

export interface IHotelFilterEmits {
  toggle: [key: string]
}
