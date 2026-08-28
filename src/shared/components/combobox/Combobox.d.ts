/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IComboboxOption {
  value: string
  label: string
  hint?: string
}

export interface IComboboxProps {
  label: string
  options: IComboboxOption[]
  placeholder?: string
  icon?: string
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  variant?: 'panel' | 'bar' | 'field'
  note?: string
  unavailable?: boolean
}
