import { MODAL_CONTEXT } from '~/shared/services/ui/modal'
import type { IModalContext, ModalService } from '~/shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useModal = () => {
  const { $modal } = useNuxtApp() as unknown as { $modal: ModalService }

  return $modal
}

export const useModalContext = <T = unknown>(): IModalContext<T> => {
  const context = inject(MODAL_CONTEXT, null) as IModalContext<T> | null

  return context ?? {
    resolve: () => {},
    dismiss: () => {},
    config: {},
  }
}
