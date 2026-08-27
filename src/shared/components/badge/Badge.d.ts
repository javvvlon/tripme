/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type BadgeTone =
  | 'hot' | 'deal' | 'glass'
  | 'primary' | 'secondary' | 'sale'
  | 'onPhoto'

export interface IBadgeProps {
  tone?: BadgeTone
}
