/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type StatusBadgeKind = 'beta' | 'new' | 'premium'

export interface IStatusBadgeProps {
  kind?: StatusBadgeKind
  interactive?: boolean
}

export interface IStatusBadgeEmits {
  open: []
}
