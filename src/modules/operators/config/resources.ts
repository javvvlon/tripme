import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Operators',
  prefix: 'cms/operators',
  resources: {
    all: { url: '', method: 'GET' },
    patch: { url: ':id', method: 'PATCH' },
  },
}
