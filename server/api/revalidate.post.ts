/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler(async (event) => {
  const expected = useRuntimeConfig(event).revalidateSecret

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

  return { cleared: keys.length }
})
