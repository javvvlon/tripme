import { LOCALES } from '~/shared/config/locales'
import { PUBLIC_PAGES } from '~/shared/config/seo'

interface IPostRef {
  slug: string
  published_at: string | null
  translations: Array<{ locale: string }>
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
