import type { IResource } from '../../../shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const resource: IResource = {
  name: 'Messages',
  prefix: '',
  resources: {
    mine: { url: 'account/messages', method: 'GET' },
    mineUnread: { url: 'account/messages/unread', method: 'GET' },
    sendMine: { url: 'account/messages', method: 'POST' },
    inbox: { url: 'cms/messages', method: 'GET' },
    inboxUnread: { url: 'cms/messages/unread', method: 'GET' },
    clientThread: { url: 'cms/clients/:id/messages', method: 'GET' },
    clientUnread: { url: 'cms/clients/:id/messages/unread', method: 'GET' },
    sendToClient: { url: 'cms/clients/:id/messages', method: 'POST' },
  },
}
