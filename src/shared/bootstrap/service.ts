import type { IBootstrappedApp, IModule, IModuleRoute } from './contracts'
import type { IMiddleware, IResource } from '~/shared/contracts/data'
import type { IModalRegistry } from '~/shared/services/ui/modal'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class AppBootstrap {
  protected _modules: IModule[] = []

  constructor(modules: IModule[]) {
    this._modules = modules
  }

  public get modules(): IModule[] {
    return this._modules
  }

  public bootSync(): IBootstrappedApp {
    const routes: IModuleRoute[] = this._modules.flatMap(m => m.routes ?? [])

    const resources: IResource[] = this._modules.flatMap((m) => {
      if (m.resources) return m.resources
      return m.resource ? [m.resource] : []
    })

    const middlewares: IMiddleware[] = this._modules.flatMap(m => m.middlewares ?? [])

    const modals: IModalRegistry = {}

    for (const module of this._modules) {
      for (const [key, entry] of Object.entries(module.modals ?? {})) {
        /**
         * Two modules claiming one key would mean whichever booted last wins,
         * silently, and the other module's modal would never open again.
         */
        if (modals[key]) {
          throw new Error(`Modal "${key}" is registered by more than one module`)
        }

        modals[key] = entry
      }
    }

    this.assertUniqueRouteNames(routes)

    return { routes, resources, middlewares, modals }
  }

  public boot(): Promise<IBootstrappedApp> {
    return Promise.resolve(this.bootSync())
  }

  private assertUniqueRouteNames(routes: IModuleRoute[]): void {
    const seen = new Set<string>()

    const walk = (list: IModuleRoute[]) => {
      for (const r of list) {
        if (seen.has(r.name)) throw new Error(`Duplicate module route name "${r.name}".`)
        seen.add(r.name)
        if (r.children) walk(r.children)
      }
    }

    walk(routes)
  }
}
