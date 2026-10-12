/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const THEMES = ['dark', 'light'] as const

export type Theme = typeof THEMES[number]

export const DEFAULT_THEME: Theme = 'dark'

export const THEME_KEY = 'tm_theme'

export const THEME_COLOR: Record<Theme, string> = { dark: '#0A0A0A', light: '#F8F9FA' }

export const LIGHT_ONLY_LAYOUTS = ['cms']

export const LIGHT_ONLY_PATH = '^/[a-z]{2}/app(?:/(?!content/frame)|$)'

export const THEME_BOOT = `(function(){var t='${DEFAULT_THEME}';try{var s=localStorage.getItem('${THEME_KEY}');if(s==='dark'||s==='light')t=s}catch(e){}if(new RegExp('${LIGHT_ONLY_PATH}').test(location.pathname))t='light';document.documentElement.setAttribute('data-theme',t)})()`
