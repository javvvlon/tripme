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
    requests: { url: 'account/requests', method: 'GET' },
    esim: { url: 'account/esim', method: 'GET' },
    travellers: { url: 'account/travellers', method: 'GET' },
    addTraveller: { url: 'account/travellers', method: 'POST' },
    updateTraveller: { url: 'account/travellers/:id', method: 'PATCH' },
    removeTraveller: { url: 'account/travellers/:id', method: 'DELETE' },
    sendPhoneCode: { url: 'users/profile/phone/send-code', method: 'POST' },
    verifyPhone: { url: 'users/profile/phone/verify', method: 'POST' },
    deleteAccount: { url: 'users/profile', method: 'DELETE' },
    uploadDocument: { url: 'account/orders/:id/documents', method: 'POST' },
    removeDocument: { url: 'account/documents/:id', method: 'DELETE' },
  },
}
