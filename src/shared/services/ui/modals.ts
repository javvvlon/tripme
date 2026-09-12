import { contentModals } from '~/modules/content/modals'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const Modal = {
  ...contentModals,
} as const

export type ModalName = typeof Modal[keyof typeof Modal]
