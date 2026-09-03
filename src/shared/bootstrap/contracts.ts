import type { IMiddleware, IResource } from '~/shared/contracts/data'
import type { IModalRegistry } from '~/shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IModuleRoute {
  name: string
  path: string
  file?: string
  redirect?: string
  layout?: string | false
  prerender?: boolean
  swr?: number
  ssr?: boolean
  meta?: Record<string, unknown>
  children?: IModuleRoute[]
}

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IModule {
  name: string
  routes?: IModuleRoute[]
  resource?: IResource
  resources?: IResource[]
  middlewares?: IMiddleware[]
  /** Modals this module owns, keyed so anywhere can open them. */
  modals?: IModalRegistry
}

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBootstrappedApp {
  routes: IModuleRoute[]
  resources: IResource[]
  middlewares: IMiddleware[]
  modals: IModalRegistry
}
