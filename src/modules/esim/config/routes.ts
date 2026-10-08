import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'esim-countries',
    path: '/esim',
    file: 'modules/esim/views/esimCountries/EsimCountries.vue',
    meta: { header: 'solid' },
  },
  {
    name: 'esim-country',
    path: '/esim/:country([a-z]{2})',
    file: 'modules/esim/views/esimCountry/EsimCountry.vue',
    meta: { header: 'solid' },
  },
  {
    name: 'esim-order',
    path: '/esim/order/:token',
    file: 'modules/esim/views/esimOrder/EsimOrder.vue',
    ssr: false,
    meta: { header: 'solid' },
  },
  {
    name: 'esim-pay',
    path: '/esim/pay/:token',
    file: 'modules/esim/views/esimPay/EsimPay.vue',
    ssr: false,
    meta: { header: 'solid' },
  },
  {
    name: 'cms-esim',
    path: '/app/esim',
    file: 'modules/esim/views/esimPurchases/EsimPurchases.vue',
    layout: 'cms',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
