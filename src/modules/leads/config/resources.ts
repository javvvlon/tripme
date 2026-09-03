import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Leads',
  prefix: '',
  resources: {
    submit: { url: 'leads', method: 'POST' },

    adminLeads: { url: 'cms/leads', method: 'GET', params: ['status', 'q', 'sort', 'dir'] },
    adminLead: { url: 'cms/leads/:id', method: 'GET' },
    createLead: { url: 'cms/leads', method: 'POST' },
    patchLead: { url: 'cms/leads/:id', method: 'PATCH' },
    deleteLead: { url: 'cms/leads/:id', method: 'DELETE' },

    orders: { url: 'cms/orders', method: 'GET', params: ['q', 'status'] },
    leadOrders: { url: 'cms/leads/:id/orders', method: 'GET' },
    createOrder: { url: 'cms/leads/:id/orders', method: 'POST' },
    order: { url: 'cms/orders/:id', method: 'GET' },
    orderHistory: { url: 'cms/orders/:id/history', method: 'GET' },
    orderDocuments: { url: 'cms/orders/:id/documents', method: 'GET' },
    generateDocument: { url: 'cms/orders/:id/documents/:kind', method: 'POST' },
    attachDocument: { url: 'cms/orders/:id/attachments', method: 'POST' },
    removeDocument: { url: 'cms/documents/:id', method: 'DELETE' },
    patchOrder: { url: 'cms/orders/:id', method: 'PATCH' },
    deleteOrder: { url: 'cms/orders/:id', method: 'DELETE' },
  },
}
