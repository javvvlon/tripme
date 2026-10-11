import { LOCALES } from '~/shared/config/locales'
import { PRIVATE_PATHS } from '~/shared/config/seo'

const HIDDEN_HOSTS = /(\.vercel\.app|^localhost|^127\.0\.0\.1)(:\d+)?$/

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  const host = getRequestHost(event, { xForwardedHost: true })

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  if (HIDDEN_HOSTS.test(host)) return 'User-agent: *\nDisallow: /\n'

  const closed = LOCALES.flatMap(locale => PRIVATE_PATHS.map(path => `Disallow: /${locale}${path}`))

  return ['User-agent: *', 'Allow: /', ...closed, '', `Sitemap: https://${host}/sitemap.xml`, ''].join('\n')
})
