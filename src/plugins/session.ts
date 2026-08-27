import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin({
  name: 'session',
  dependsOn: ['http'],

  async setup() {
    const { refresh, restore } = useAuthSession()
    const { $http } = useNuxtApp()

    ;($http as ReturnType<typeof useNuxtApp>['$http']).registerUnauthorizedHandler(() => refresh())

    await restore()
  },
})
