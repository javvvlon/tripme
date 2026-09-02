import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-leads',
    path: '/app/leads',
    file: 'modules/leads/views/leads/Leads.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-lead',
    path: '/app/leads/:id',
    file: 'modules/leads/views/lead/Lead.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-orders',
    path: '/app/orders',
    file: 'modules/leads/views/orders/Orders.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-order',
    path: '/app/orders/:id',
    file: 'modules/leads/views/order/Order.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
