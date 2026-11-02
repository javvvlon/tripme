import { contactRedirect } from '../../src/shared/config/contact-aliases'
import { LOCALE_COOKIE } from '../../src/shared/components/langSwitcher/LangSwitcher.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return

  const [path = '/', query] = event.path.split('?')
  const target = contactRedirect(path, getCookie(event, LOCALE_COOKIE))

  if (target) return sendRedirect(event, query ? `${target}?${query}` : target, 301)
})
