import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'account-messages',
    path: '/account/messages',
    file: 'modules/messages/views/clientMessages/ClientMessages.vue',
    layout: 'account',
    ssr: false,
    meta: { middleware: 'customer' },
  },
  {
    name: 'cms-messages',
    path: '/app/messages',
    file: 'modules/messages/views/inbox/Inbox.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
