/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ChipTone = 'onLight' | 'onDark'

export interface IChipProps {
  to?: string
  icon?: string
  active?: boolean
  tone?: ChipTone
}
