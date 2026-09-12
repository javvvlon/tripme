import { modules } from '~/modules'
import { AppBootstrap } from '~/shared/bootstrap/service'
import { ToastService } from '~/shared/services/ui/toast'
import { ModalService } from '~/shared/services/ui/modal'
import type { IToast } from '~/shared/services/ui/toast'
import type { IOpenModal } from '~/shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
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
