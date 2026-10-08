import type { IModule } from '../../shared/bootstrap/contracts'
import { resource } from './config/resources'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const FinanceModule: IModule = {
  name: 'Finance',
  resource,
}
