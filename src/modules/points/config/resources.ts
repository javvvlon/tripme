import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Points',
  prefix: '',
  resources: {
    overview: { url: 'cms/points', method: 'GET' },
    rates: { url: 'cms/points/rates', method: 'PUT' },
    createTier: { url: 'cms/points/tiers', method: 'POST' },
    patchTier: { url: 'cms/points/tiers/:id', method: 'PATCH' },
    removeTier: { url: 'cms/points/tiers/:id', method: 'DELETE' },
    customer: { url: 'cms/points/customers/:id', method: 'GET' },
    adjust: { url: 'cms/points/customers/:id/adjust', method: 'POST' },
    mine: { url: 'account/points', method: 'GET' },
  },
}
