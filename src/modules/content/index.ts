import type { IModule } from '../../shared/bootstrap/contracts'
import { resource } from './config/resources'
import { routes } from './config/routes'
import { contentModalRegistry } from './modals'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ContentModule: IModule = {
  name: 'Content',
  routes,
  resource,
  modals: contentModalRegistry,
}
