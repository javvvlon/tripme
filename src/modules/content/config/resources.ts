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

    pageContent: { url: 'pages/:page', method: 'GET' },

    layouts: { url: 'layouts', method: 'GET' },
    createLayout: { url: 'layouts', method: 'POST' },
    deleteLayout: { url: 'layouts/:id', method: 'DELETE' },
    lists: { url: 'lists', method: 'GET' },
    list: { url: 'lists/:id', method: 'GET' },
    createList: { url: 'lists', method: 'POST' },
    updateList: { url: 'lists/:id', method: 'PUT' },
    deleteList: { url: 'lists/:id', method: 'DELETE' },
    sections: { url: 'pages/:page/sections', method: 'GET' },
    saveSections: { url: 'pages/:page/sections', method: 'PUT' },
    pageMeta: { url: 'pages/:page/meta', method: 'GET' },
    savePageMeta: { url: 'pages/:page/meta', method: 'PUT' },
    upload: { url: 'uploads', method: 'POST' },
    library: { url: 'uploads', method: 'GET', params: ['q', 'folder'] },
    folders: { url: 'media/folders', method: 'GET' },
    createFolder: { url: 'media/folders', method: 'POST' },
    renameFolder: { url: 'media/folders/:id', method: 'PATCH' },
    deleteFolder: { url: 'media/folders/:id', method: 'DELETE' },
    removeUpload: { url: 'uploads', method: 'DELETE', params: ['url'] },
    renameUpload: { url: 'uploads', method: 'PATCH' },
  },
}
