import type { HttpRequestConfig, IResource } from '~/shared/contracts/data'
import type { IModule } from '~/shared/bootstrap'
import { HttpConnector } from './service'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
function collectResources(mods: IModule[]): IResource[] {
  const out: IResource[] = []

  for (const m of mods) {
    const raw = m.resources ?? m.resource
    if (!raw) continue

    if (Array.isArray(raw)) {
      out.push(...raw)
      continue
    }

    out.push(raw)
  }

  return out
}

export function connector(config: HttpRequestConfig, modules: IModule[]): HttpConnector {
  const http = new HttpConnector(config)

  const resources = collectResources(modules)
  const middlewares = modules.flatMap(m => m.middlewares ?? [])

  if (!resources.length) {
    const moduleNames = modules.map(m => m.name).join(', ') || '(none)'
    throw new Error(`No resources found in modules: ${moduleNames}. Expected 'resources' or 'resource'.`)
  }

  http.registerResource(resources)
  http.registerMiddleware(middlewares)

  return http
}
