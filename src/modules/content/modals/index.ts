import { ModalSize } from '../../../shared/components/modal/Modal.config'
import type { IModalRegistry } from '../../../shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const contentModals = {
  Gallery: 'content:gallery',
} as const

export const contentModalRegistry: IModalRegistry = {
  [contentModals.Gallery]: {
    component: () => import('../../../shared/components/mediaLibrary/MediaLibrary.vue'),
    config: { size: ModalSize.Medium },
  },
}
