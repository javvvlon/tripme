/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type SearchFieldVariant = 'panel' | 'bar'

export interface ISearchFieldProps {
  label: string
  placeholder?: string
  icon?: string
  clearable?: boolean
  variant?: SearchFieldVariant
}
