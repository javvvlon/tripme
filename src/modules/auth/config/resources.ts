import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Auth',
  prefix: 'users',
  resources: {
    login: { url: 'auth/login/', method: 'POST', skipAuthRefresh: true },
    signup: { url: 'auth/signup/', method: 'POST', skipAuthRefresh: true },
    refresh: { url: 'auth/login/refresh/', method: 'POST', skipAuthRefresh: true },
    logout: { url: 'auth/logout/', method: 'POST', skipAuthRefresh: true },
    sendVerification: { url: 'auth/send-verification-message/', method: 'POST' },
    verify: { url: 'auth/verify/', method: 'POST' },
    me: { url: 'profile/', method: 'GET' },
  },
}
