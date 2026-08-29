/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ISelectMenuOption {
  value: string
  label: string
}

export interface ISelectMenuProps {
  options: ISelectMenuOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  tone?: string
  align?: 'left' | 'right'
}
