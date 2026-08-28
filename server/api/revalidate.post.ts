import { LOCALES } from '~/shared/config/locales'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const expected = config.revalidateSecret

  if (!expected) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const provided = getHeader(event, 'x-revalidate-secret')

  if (provided !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const cache = useStorage('cache')
  const keys = await cache.getKeys('nitro:routes')

  await Promise.all(keys.map(key => cache.removeItem(key)))

  const bypassToken = config.vercelBypassToken
  let refreshed = 0

  if (bypassToken) {
    const origin = getRequestURL(event).origin
    const paths = LOCALES.flatMap(locale => [`/${locale}`, `/${locale}/_payload.json`])

    const results = await Promise.allSettled(paths.map(path => $fetch(`${origin}${path}`, {
      headers: { 'x-prerender-revalidate': bypassToken },
    })))

    refreshed = results.filter(result => result.status === 'fulfilled').length
  }

  return { cleared: keys.length, refreshed }
})
