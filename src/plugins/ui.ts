import { modules } from '~/modules'
import { AppBootstrap } from '~/shared/bootstrap/service'
import { ToastService } from '~/shared/services/ui/toast'
import { ModalService } from '~/shared/services/ui/modal'
import type { IToast } from '~/shared/services/ui/toast'
import type { IOpenModal } from '~/shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 *
 * The interface services, built once per request.
 *
 * This is the locator the app resolves through — `useToast()` and
 * `useModal()` read it back out. Nuxt already hands every request its own
 * container, so the services live on that rather than at module scope, where
 * the server would share one stack of toasts between everyone at once.
 */
export default defineNuxtPlugin({
  name: 'ui',

  setup() {
    const { modals } = new AppBootstrap(modules).bootSync()

    const toast = new ToastService(ref<IToast[]>([]))
    const modal = new ModalService(modals, ref<IOpenModal[]>([]))

    return {
      provide: { toast, modal },
    }
  },
})
