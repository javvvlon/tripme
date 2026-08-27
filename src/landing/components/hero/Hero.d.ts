import type { IHomeBanner } from '~/modules/content/models/HomeContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IHeroProps {
  /**
   * The published banner. Null means nobody has written one yet, and the copy
   * built into the design stands in — a home page without a headline is
   * broken, so this is the one place a fallback is right.
   */
  banner?: IHomeBanner | null
}
