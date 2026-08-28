import type { IResource } from '../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Landing',
  prefix: '',
  resources: {
    contact: { url: 'contact', method: 'POST' },
  },
}
