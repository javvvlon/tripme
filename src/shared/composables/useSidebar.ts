/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const COLLAPSED_KEY = 'tm_sidebar_collapsed'

export const useSidebar = () => {
  const cookie = useCookie<string | null>(COLLAPSED_KEY, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  const collapsed = useState<boolean>('cms:sidebar-collapsed', () => cookie.value === '1')

  watch(collapsed, (value) => { cookie.value = value ? '1' : '0' })

  return { collapsed }
}
