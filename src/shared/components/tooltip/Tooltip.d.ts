/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type TooltipSide = 'top' | 'bottom' | 'right'

export interface ITooltipProps {
  text: string
  side?: TooltipSide
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  tag?: string
}
