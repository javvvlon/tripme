import type { IMiddleware, IResource } from '~/shared/contracts/data'

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
}

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBootstrappedApp {
  routes: IModuleRoute[]
  resources: IResource[]
  middlewares: IMiddleware[]
}
