import type { IModule } from '../../shared/bootstrap/contracts'
import { resource } from './config/resources'
import { routes } from './config/routes'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PostsModule: IModule = {
  name: 'Posts',
  routes,
  resource,
}
