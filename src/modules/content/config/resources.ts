import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Content',
  prefix: 'cms',
  resources: {
    banner: { url: 'home/banner/', method: 'GET' },
    saveBanner: { url: 'home/banner/', method: 'PUT' },

    homeContent: { url: 'home/sections/', method: 'GET' },

    layouts: { url: 'layouts', method: 'GET' },
    lists: { url: 'lists', method: 'GET' },
    list: { url: 'lists/:id', method: 'GET' },
    createList: { url: 'lists', method: 'POST' },
    updateList: { url: 'lists/:id', method: 'PUT' },
    deleteList: { url: 'lists/:id', method: 'DELETE' },
    sections: { url: 'sections', method: 'GET' },
    saveSections: { url: 'sections', method: 'PUT' },
    upload: { url: 'uploads', method: 'POST' },
    removeUpload: { url: 'uploads', method: 'DELETE', params: ['url'] },
  },
}
