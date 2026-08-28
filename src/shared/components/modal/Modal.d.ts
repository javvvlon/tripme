/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IModalProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md'
}
