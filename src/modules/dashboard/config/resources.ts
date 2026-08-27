import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Dashboard',
  prefix: 'crm',
  resources: {
    fetchClients: { url: 'clients/', method: 'GET', params: ['page', 'size', 'q'] },
    fetchClient: { url: 'clients/:client_id/', method: 'GET' },
    createClient: { url: 'clients/', method: 'POST' },
    updateClient: { url: 'clients/:client_id/', method: 'PATCH' },
    fetchProposals: { url: 'proposals/', method: 'GET', params: ['client_id', 'page', 'size'] },
    createProposal: { url: 'proposals/', method: 'POST' },
  },
}
