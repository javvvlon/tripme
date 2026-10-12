import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Team',
  prefix: 'cms',
  resources: {
    members: { url: 'team', method: 'GET' },
    createMember: { url: 'team', method: 'POST' },
    resetPassword: { url: 'team/:id/password', method: 'POST' },
    archiveMember: { url: 'team/:id/archive', method: 'POST' },
    restoreMember: { url: 'team/:id/restore', method: 'POST' },
    myWork: { url: 'me/work', method: 'GET' },
  },
}
