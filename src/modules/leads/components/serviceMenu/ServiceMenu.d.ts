/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ServiceChoice = 'tour' | 'esim'

export interface IServiceMenuProps {
  label: string
  esim?: boolean
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}

export interface IServiceMenuEmits {
  select: [choice: ServiceChoice]
}
