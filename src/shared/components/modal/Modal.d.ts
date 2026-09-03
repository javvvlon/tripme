import type { ModalSizeValue } from './Modal.config'

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
  size?: ModalSizeValue
  /** Off for modals that finish by picking something rather than confirming. */
  footer?: boolean
  tone?: 'default' | 'danger'
}
