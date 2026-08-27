import { connector } from '~/shared/services/api/connector'
import { modules } from '~/modules'
import { createAuthMiddleware } from '~/modules/auth/middlewares/auth.middleware'
import { useAuthStorage } from '~/modules/auth/storage/auth-storage'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin({
  name: 'http',

  setup() {
    const { apiBase } = useRuntimeConfig().public

    const headers: Record<string, string> = {}

    if (import.meta.server) {
      const cookie = useRequestHeaders(['cookie']).cookie

      if (cookie) headers.cookie = cookie
    }

    const http = connector(
      {
        baseURL: apiBase,
        headers,
        credentials: 'include',
      },
      modules,
    )

    const storage = useAuthStorage()

    http.registerMiddleware(createAuthMiddleware(kind =>
      kind === 'refresh' ? storage.getRefreshToken() : storage.getAccessToken()))

    return {
      provide: { http },
    }
  },
})
