/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type CatalogKind = 'country' | 'city'

export function useCatalogLabel() {
  const { t, te } = useI18n()

  const label = (slug: string | null | undefined, kind: CatalogKind = 'country'): string => {
    if (!slug) return ''

    const key = `${kind}.${slug}`
    if (te(key)) return t(key)

    const other = kind === 'country' ? `city.${slug}` : `country.${slug}`
    if (te(other)) return t(other)

    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/[-_]/g, ' ')
  }

  return { label }
}
