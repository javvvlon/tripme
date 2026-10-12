import type { RouteLocationNormalized } from 'vue-router'
import { DEFAULT_THEME, LIGHT_ONLY_LAYOUTS, THEME_COLOR, THEME_KEY, THEMES } from '~/shared/config/theme'
import type { Theme } from '~/shared/config/theme'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTheme = () => {
  const preference = useState<Theme>('theme', () => DEFAULT_THEME)

  const stored = (): Theme => {
    try {
      const value = localStorage.getItem(THEME_KEY)

      return THEMES.includes(value as Theme) ? value as Theme : DEFAULT_THEME
    }
    catch {
      return DEFAULT_THEME
    }
  }

  const paint = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }

  const apply = (route: RouteLocationNormalized): void => {
    paint(LIGHT_ONLY_LAYOUTS.includes(String(route.meta.layout)) ? 'light' : preference.value)
  }

  const set = (theme: Theme): void => {
    preference.value = theme

    try {
      localStorage.setItem(THEME_KEY, theme)
    }
    catch {}

    paint(theme)
  }

  const toggle = (): void => set(preference.value === 'dark' ? 'light' : 'dark')

  return { preference, stored, apply, set, toggle }
}
