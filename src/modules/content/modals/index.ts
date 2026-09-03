import { ModalSize } from '../../../shared/components/modal/Modal.config'
import type { IModalRegistry } from '../../../shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 *
 * Keys are namespaced by module so two modules cannot claim the same one —
 * the bootstrap refuses a collision rather than letting the later module win.
 *
 * Relative imports, not `~`: nuxt.config reads the module registry at build
 * time through jiti, where the alias does not resolve. The component itself
 * sits behind a thunk, so it is never loaded during that pass.
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
