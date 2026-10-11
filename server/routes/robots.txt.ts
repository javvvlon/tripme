import { LOCALES } from '~/shared/config/locales'
import { PRIVATE_PATHS } from '~/shared/config/seo'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')
  const host = getRequestHost(event, { xForwardedHost: true })

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  if (host !== new URL(site).host) return 'User-agent: *\nDisallow: /\n'

  const closed = LOCALES.flatMap(locale => PRIVATE_PATHS.map(path => `Disallow: /${locale}${path}`))

  return ['User-agent: *', 'Allow: /', ...closed, '', `Sitemap: ${site}/sitemap.xml`, ''].join('\n')
})
