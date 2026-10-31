import type { RouteLocationNormalized } from 'vue-router'
import { CMS_CLASS, DEFAULT_THEME, LIGHT_ONLY_LAYOUTS, THEME_COLOR, THEME_COOKIE_MAX_AGE, THEME_KEY, THEMES } from '~/shared/config/theme'
import type { Theme } from '~/shared/config/theme'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTheme = () => {
  const preference = useState<Theme>('theme', () => DEFAULT_THEME)

  const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme)

  const stored = (): Theme => {
    let value: string | null = null

    try {
      value = localStorage.getItem(THEME_KEY)
    }
    catch {}

    if (isTheme(value)) return value

    const cookie = new RegExp(`(?:^|; )${THEME_KEY}=([a-z]+)`).exec(document.cookie)?.[1]

    return isTheme(cookie) ? cookie : DEFAULT_THEME
  }

  const paint = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }

  const apply = (route: RouteLocationNormalized): void => {
    const cms = LIGHT_ONLY_LAYOUTS.includes(String(route.meta.layout))

    document.documentElement.classList.toggle(CMS_CLASS, cms)
    paint(cms ? 'light' : preference.value)
  }

  const set = (theme: Theme): void => {
    preference.value = theme

    try {
      localStorage.setItem(THEME_KEY, theme)
    }
    catch {}

    document.cookie = `${THEME_KEY}=${theme}; Max-Age=${THEME_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`

    paint(theme)
  }

  const toggle = (): void => set(preference.value === 'dark' ? 'light' : 'dark')

  return { preference, stored, apply, set, toggle }
}
