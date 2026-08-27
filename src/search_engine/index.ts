import type { IModule } from '../shared/bootstrap/contracts'
import { referencesResource, resource } from './config/resources'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SearchEngineModule: IModule = {
  name: 'SearchEngine',
  resources: [resource, referencesResource],
}
