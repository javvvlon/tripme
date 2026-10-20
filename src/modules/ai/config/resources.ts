import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Ai',
  prefix: '',
  resources: {
    ask: { url: 'cms/ai', method: 'POST' },
  },
}
