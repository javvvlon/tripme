/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IFilterListOption {
  value: string
  label: string
  count: number
}

export interface IFilterListProps {
  options: IFilterListOption[]
  selected: string[]
  limit?: number
  searchLabel?: string
}

export interface IFilterListEmits {
  toggle: [value: string]
}
