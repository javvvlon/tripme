import type { BlockTone } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ICtaStripProps {
  title: string
  text?: string | null
  ctaLabel?: string | null
  link?: string | null
  tone?: BlockTone
}
