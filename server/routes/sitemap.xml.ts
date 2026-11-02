import { LOCALES } from '~/shared/config/locales'
import { PUBLIC_PAGES } from '~/shared/config/seo'
import { routePagePath } from '~/shared/config/route-pages'

interface IPostRef {
  slug: string
  published_at: string | null
  translations: Array<{ locale: string }>
}

interface IRouteRef {
  from: { slug: string }
  to: { slug: string }
}

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const site = String(config.public.siteUrl).replace(/\/+$/, '')
  const posts = await $fetch<IPostRef[]>(`${config.public.apiBase}/posts`, { timeout: 8000 }).catch(() => [])
  const routes = await $fetch<{ items: IRouteRef[] }>(`${config.public.apiBase}/search/routes`, { timeout: 8000 }).catch(() => ({ items: [] }))

  const entry = (path: string, locales: readonly string[], lastmod?: string | null) => locales.map(locale => [
    '  <url>',
    `    <loc>${escape(`${site}/${locale}${path}`)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod.slice(0, 10)}</lastmod>`] : []),
    ...locales.map(other => `    <xhtml:link rel="alternate" hreflang="${other}" href="${escape(`${site}/${other}${path}`)}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(`${site}/${locales[0]}${path}`)}"/>`,
    '  </url>',
  ].join('\n'))

  const urls = [
    ...PUBLIC_PAGES.flatMap(path => entry(path, LOCALES)),
    ...(Array.isArray(posts) ? posts : []).flatMap((post) => {
      const locales = LOCALES.filter(locale => post.translations?.some(translation => translation.locale === locale))

      return locales.length ? entry(`/blog/${post.slug}`, locales, post.published_at) : []
    }),
    ...(Array.isArray(routes?.items) ? routes.items : []).flatMap(route => entry(routePagePath(route.from.slug, route.to.slug), LOCALES)),
  ]

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}, { maxAge: 3600, name: 'sitemap' })
