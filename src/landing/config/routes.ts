import type { IModuleRoute } from '../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'landing-home',
    path: '/',
    file: 'landing/views/home/Home.vue',
    swr: 60,
    meta: { header: 'over' },
  },
  {
    name: 'landing-search',
    path: '/search',
    file: 'landing/views/search/Search.vue',
    meta: { header: 'solid', headerSearch: true },
  },
  {
    name: 'landing-contact',
    path: '/contact',
    file: 'landing/views/contact/Contact.vue',
    meta: { header: 'solid' },
  },
]
