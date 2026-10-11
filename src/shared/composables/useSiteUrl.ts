/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSiteUrl = () => {
  const siteUrl = String(useRuntimeConfig().public.siteUrl).replace(/\/+$/, '')

  const absolute = (path: string): string => (/^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`)

  return { siteUrl, absolute }
}
