/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type LogoVariant = 'full' | 'mark'

export interface ILogoProps {
  variant?: LogoVariant
  width?: number
  label?: string
}
