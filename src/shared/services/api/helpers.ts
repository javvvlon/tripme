import type { AnyObject, IResource, ResourceActionDescription } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const findResource = (name: string, list: IResource[]): IResource => {
  const r = list.find(x => x.name === name)
  if (!r) {
    const known = list.map(x => x.name).join(', ') || '(none)'
    throw new Error(`Unknown resource "${name}". Known: ${known}.`)
  }
  return r
}

export const findAction = (action: string, resource: IResource): ResourceActionDescription => {
  const a = resource.resources[action]
  if (!a) {
    const known = Object.keys(resource.resources).join(', ') || '(none)'
    throw new Error(`Unknown action "${resource.name}/${action}". Known: ${known}.`)
  }
  return a
}

export const replaceVariables = (
  url: string,
  params: AnyObject,
  whitelist?: readonly string[],
): { url: string, filteredParams?: Record<string, unknown> } => {
  const used = new Set<string>()
  const out = url.replace(/:([A-Za-z0-9_]+)/g, (_, k: string) => {
    if (!(k in params)) throw new Error(`Missing path param ":${k}" for "${url}"`)
    used.add(k)
    return String(params[k])
  })

  let filtered: Record<string, unknown> | undefined

  if (whitelist?.length) {
    filtered = {}
    for (const k of whitelist) {
      if (params[k] !== undefined) filtered[k] = params[k]
    }
    if (!Object.keys(filtered).length) filtered = undefined
  }
  else {
    filtered = Object.fromEntries(Object.entries(params).filter(([k]) => !used.has(k)))
    if (!Object.keys(filtered).length) filtered = undefined
  }

  return {
    url: out.replace(/^\//, '').replace(/\/{2,}/g, '/'),
    filteredParams: filtered,
  }
}
