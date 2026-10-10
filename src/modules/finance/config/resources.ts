import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Finance',
  prefix: '',
  resources: {
    overview: { url: 'cms/orders/:id/finance', method: 'GET' },
    recordPayment: { url: 'cms/orders/:id/payments', method: 'POST' },
    reversePayment: { url: 'cms/payments/:id/reverse', method: 'POST' },
    setDeposit: { url: 'cms/orders/:id/deposit', method: 'PATCH' },
  },
}
