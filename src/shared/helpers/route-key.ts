import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const LOCALE_PREFIX = /^\/(?:ru|uz|en)(?=\/|$)/

export function localeFreeKey(route: Pick<RouteLocationNormalizedLoaded, 'matched' | 'params' | 'path'>): string {
  const record = route.matched.at(-1)
  const path = record
    ? record.path
        .replace(/(:\w+)\([^)]+\)/g, '$1')
        .replace(/(:\w+)[?+*]/g, '$1')
        .replace(/:\w+/g, name => String(route.params[name.slice(1)] ?? ''))
    : route.path

  return path.replace(LOCALE_PREFIX, '') || '/'
}
