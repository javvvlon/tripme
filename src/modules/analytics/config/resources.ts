import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Analytics',
  prefix: 'cms/analytics',
  resources: {
    report: { url: '', method: 'GET', params: ['from', 'to'] },
  },
}
