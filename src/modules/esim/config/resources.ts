import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Esim',
  prefix: '',
  resources: {
    countries: { url: 'esim/countries', method: 'GET' },
    plans: { url: 'esim/countries/:code', method: 'GET' },
    methods: { url: 'esim/methods', method: 'GET' },
    checkout: { url: 'esim/purchases', method: 'POST' },
    purchase: { url: 'esim/purchases/:token', method: 'GET' },
    sandboxPay: { url: 'esim/sandbox/:token', method: 'POST' },
    purchases: { url: 'cms/esim/purchases', method: 'GET', params: ['page', 'per_page', 'status', 'q'] },
    retry: { url: 'cms/esim/purchases/:id/retry', method: 'POST' },
  },
}
