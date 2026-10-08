/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface INavbarItemProps {
  label: string
  icon?: string
  to?: string
  active?: boolean
  disabled?: boolean
  badge?: string | number | null
  accent?: boolean
}
