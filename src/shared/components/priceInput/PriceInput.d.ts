/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPriceInputProps {
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  /** Shown inside the field, so an amount is never read without its unit. */
  currency?: string
}
