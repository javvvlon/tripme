import { isPrivatePath } from '../../src/shared/config/seo'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  if (isPrivatePath(event.path)) setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow')
})
