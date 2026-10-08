import type { IContentSection } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IContentSectionProps {
  section: IContentSection
  eager?: boolean
}
