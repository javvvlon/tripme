/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IInputProps {
  label?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'search'
  placeholder?: string
  error?: string
  hint?: string
  autocomplete?: string
  disabled?: boolean
  required?: boolean
  revealable?: boolean
}
