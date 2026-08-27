/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type SiteHeaderVariant = 'over' | 'solid'

export interface ISiteHeaderProps {
  variant?: SiteHeaderVariant
  withSearch?: boolean
}
