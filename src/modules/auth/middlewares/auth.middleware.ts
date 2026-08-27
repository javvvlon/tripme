import type { IMiddleware } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type TokenKind = 'access' | 'refresh'

export type TokenReader = (kind: TokenKind) => string | null

export const createAuthMiddleware = (read: TokenReader): IMiddleware => ({
  beforeRequest(_resource, action, config) {
    const token = read(action.url.endsWith('/refresh/') ? 'refresh' : 'access')

    if (!token) return

    config.headers = {
      ...(config.headers ?? {}),
      Authorization: `Bearer ${token}`,
    }
  },
})
