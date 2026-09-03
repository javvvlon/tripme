import { MODAL_CONTEXT } from '~/shared/services/ui/modal'
import type { IModalContext, ModalService } from '~/shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useModal = () => {
  const { $modal } = useNuxtApp() as unknown as { $modal: ModalService }

  return $modal
}

/**
 * Read from inside a modal the service opened: how to answer, and how to
 * walk away. Outside one it returns a context that does nothing, so a
 * component can be rendered both ways without guarding every call.
 */
export const useModalContext = <T = unknown>(): IModalContext<T> => {
  const context = inject(MODAL_CONTEXT, null) as IModalContext<T> | null

  return context ?? {
    resolve: () => {},
    dismiss: () => {},
    config: {},
  }
}
