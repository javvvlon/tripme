import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Leads',
  prefix: '',
  resources: {
    submit: { url: 'leads', method: 'POST' },

    adminLeads: { url: 'cms/leads', method: 'GET', params: ['status', 'q', 'sort', 'dir', 'manager', 'page', 'per_page', 'archived'] },
    adminLead: { url: 'cms/leads/:id', method: 'GET' },
    leadHistory: { url: 'cms/leads/:id/history', method: 'GET' },
    takeLead: { url: 'cms/leads/:id/take', method: 'POST' },
    newRequest: { url: 'cms/leads/:id/new-request', method: 'POST' },
    relatedLeads: { url: 'cms/leads/:id/related', method: 'GET' },
    staff: { url: 'cms/leads/staff', method: 'GET' },
    createLead: { url: 'cms/leads', method: 'POST' },
    patchLead: { url: 'cms/leads/:id', method: 'PATCH' },
    archiveLead: { url: 'cms/leads/:id/archive', method: 'POST' },
    restoreLead: { url: 'cms/leads/:id/restore', method: 'POST' },

    orders: { url: 'cms/orders', method: 'GET', params: ['q', 'status', 'manager', 'page', 'per_page', 'archived'] },
    leadOrders: { url: 'cms/leads/:id/orders', method: 'GET' },
    createOrder: { url: 'cms/leads/:id/orders', method: 'POST' },
    order: { url: 'cms/orders/:id', method: 'GET' },
    orderHistory: { url: 'cms/orders/:id/history', method: 'GET' },
    orderDocuments: { url: 'cms/orders/:id/documents', method: 'GET' },
    generateDocument: { url: 'cms/orders/:id/documents/:kind', method: 'POST' },
    attachDocument: { url: 'cms/orders/:id/attachments', method: 'POST' },
    uploadContract: { url: 'cms/orders/:id/contract', method: 'POST' },
    confirmItem: { url: 'cms/orders/:id/items/:itemId/confirm', method: 'POST' },
    addItem: { url: 'cms/orders/:id/items', method: 'POST' },
    updateItem: { url: 'cms/orders/:id/items/:itemId', method: 'PATCH' },
    removeItem: { url: 'cms/orders/:id/items/:itemId', method: 'DELETE' },
    issueItem: { url: 'cms/orders/:id/items/:itemId/issue', method: 'POST' },
    removeDocument: { url: 'cms/documents/:id', method: 'DELETE' },
    patchOrder: { url: 'cms/orders/:id', method: 'PATCH' },
    archiveOrder: { url: 'cms/orders/:id/archive', method: 'POST' },
    orderTravellers: { url: 'cms/orders/:id/travellers', method: 'GET' },
    restoreOrder: { url: 'cms/orders/:id/restore', method: 'POST' },
  },
}
