import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { ToastService } from '~/shared/services/ui/toast'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin({
  name: 'session',
  dependsOn: ['http', 'ui'],

  async setup(nuxtApp) {
    const { refresh, restore, expired } = useAuthSession()
    const { $http } = useNuxtApp()

    ;($http as ReturnType<typeof useNuxtApp>['$http']).registerUnauthorizedHandler(() => refresh())

    if (import.meta.client) {
      /**
       * Reached through the app rather than through `useToast`/`useI18n`:
       * a plugin has no component setup for those composables to attach to,
       * and calling them here takes the whole app down.
       */
      const toast = nuxtApp.$toast as ToastService
      const i18n = nuxtApp.$i18n as { t: (key: string) => string }

      /**
       * Watched before the session is restored, not after: a session that
       * lapsed while the tab was closed is found during that first restore,
       * and a watcher registered afterwards would never see it happen.
       *
       * Only the message lives here. Where to go is the route guard's call.
       */
      watch(expired, (over) => {
        if (over) toast?.error(i18n?.t('auth.expired') ?? '')
      })
    }

    await restore()
  },
})
