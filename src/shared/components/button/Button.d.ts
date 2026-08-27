/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface IButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  to?: string
  href?: string
  type?: 'button' | 'submit'
  block?: boolean
  icon?: string
  iconRight?: string
  disabled?: boolean
}
