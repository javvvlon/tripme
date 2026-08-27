/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useRouteExists = () => {
  const router = useRouter()
  const { locale } = useI18n()

  const known = computed(() => new Set(router.getRoutes().map(route => route.path)))

  return (to: string): boolean => {
    const path = to.split('?')[0]!.replace(/\/$/, '')

    return known.value.has(`/${locale.value}${path}`)
  }
}
