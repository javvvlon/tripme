/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const toMatcher = (pattern: string): RegExp => {
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/:\w+\(\.\*\)\*?/g, '.*')
    .replace(/:\w+\*/g, '.*')
    .replace(/:\w+\?/g, '[^/]*')
    .replace(/:\w+/g, '[^/]+')

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
