import { formatDate } from '~/shared/helpers/format-date'
import type { IContentItem } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const postByline = (item: IContentItem, locale: string): string => {
  const when = item.publishedAt ? formatDate(item.publishedAt, locale, { dateStyle: 'long' }, '') : ''

  return [item.author, when].filter(Boolean).join(' · ')
}
