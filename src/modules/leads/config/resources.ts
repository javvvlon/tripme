import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Leads',
  prefix: '',
  resources: {
    submit: { url: 'leads', method: 'POST' },

    adminLeads: { url: 'cms/leads', method: 'GET', params: ['status'] },
    adminLead: { url: 'cms/leads/:id', method: 'GET' },
    createLead: { url: 'cms/leads', method: 'POST' },
    patchLead: { url: 'cms/leads/:id', method: 'PATCH' },
    deleteLead: { url: 'cms/leads/:id', method: 'DELETE' },
  },
}
