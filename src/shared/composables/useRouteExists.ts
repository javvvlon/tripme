/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const toMatcher = (pattern: string): RegExp => {
  const inline: string[] = []

  const source = pattern
    .replace(/:\w+\(([^)]*)\)\*?/g, (_, regex: string) => `\u0000${inline.push(regex) - 1}\u0000`)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/:\w+\*/g, '.*')
    .replace(/:\w+\?/g, '[^/]*')
    .replace(/:\w+/g, '[^/]+')
    .replace(/\u0000(\d+)\u0000/g, (_, index: string) => `(?:${inline[Number(index)]})`)

  return new RegExp(`^${source}/?$`)
}

export const useRouteExists = () => {
  const router = useRouter()
  const { locale } = useI18n()

  const matchers = computed(() => router.getRoutes().map(route => toMatcher(route.path)))

  return (to: string): boolean => {
    const path = to.split('?')[0]!.replace(/\/$/, '')
    const full = `/${locale.value}${path}`

    return matchers.value.some(matcher => matcher.test(full))
  }
}
