/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const THEMES = ['dark', 'light'] as const

export type Theme = typeof THEMES[number]

export const DEFAULT_THEME: Theme = 'light'

export const THEME_KEY = 'tm_theme'

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const THEME_COLOR: Record<Theme, string> = { dark: '#0A0A0A', light: '#F8F9FA' }

export const LIGHT_ONLY_LAYOUTS = ['cms', 'tasks']

export const LIGHT_ONLY_PATH = '^/[a-z]{2}/app(?:/(?!content/frame)|$)'

export const CMS_CLASS = 'is-cms'

export const THEME_BOOT = `(function(){var t='${DEFAULT_THEME}',s=null,d=document.documentElement,c=new RegExp('${LIGHT_ONLY_PATH}').test(location.pathname);try{s=localStorage.getItem('${THEME_KEY}')}catch(e){}if(s!=='dark'&&s!=='light'){var m=document.cookie.match(/(?:^|; )${THEME_KEY}=(dark|light)/);s=m&&m[1]}if(s==='dark'||s==='light')t=s;if(c)t='light';d.setAttribute('data-theme',t);d.classList.toggle('${CMS_CLASS}',c)})()`
