import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'account-orders',
    path: '/account',
    file: 'modules/account/views/orders/Orders.vue',
    layout: 'account',
    ssr: false,
    meta: { middleware: 'customer' },
  },
  {
    name: 'account-order',
    path: '/account/orders/:id',
    file: 'modules/account/views/order/Order.vue',
    layout: 'account',
    ssr: false,
    meta: { middleware: 'customer' },
  },
  {
    name: 'account-profile',
    path: '/account/profile',
    file: 'modules/account/views/profile/Profile.vue',
    layout: 'account',
    ssr: false,
    meta: { middleware: 'customer' },
  },
]
