import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Account',
  prefix: '',
  resources: {
    orders: { url: 'account/orders', method: 'GET' },
    order: { url: 'account/orders/:id', method: 'GET' },
    updateProfile: { url: 'users/profile', method: 'PATCH' },
    changePassword: { url: 'users/profile/password', method: 'POST' },
  },
}
