/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMultiSelectOption {
  value: string
  label: string
  hint?: string
}

export interface IMultiSelectProps {
  label: string
  options: IMultiSelectOption[]
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  note?: string
}
