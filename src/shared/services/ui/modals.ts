import { contentModals } from '~/modules/content/modals'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 *
 * Every modal key in the app, gathered for the call site: `modal.open(
 * Modal.Gallery, …)`. Only the keys are imported here — the components stay
 * behind the modules' own registries and load when first opened.
 */
export const Modal = {
  ...contentModals,
} as const

export type ModalName = typeof Modal[keyof typeof Modal]
