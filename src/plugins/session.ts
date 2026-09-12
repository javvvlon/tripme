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
      const toast = nuxtApp.$toast as ToastService
      const i18n = nuxtApp.$i18n as { t: (key: string) => string }

      watch(expired, (over) => {
        if (over) toast?.error(i18n?.t('auth.expired') ?? '')
      })
    }

    await restore()
  },
})
