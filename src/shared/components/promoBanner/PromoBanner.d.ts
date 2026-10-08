import type { BannerStyle, BlockTone } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPromoBannerProps {
  title: string
  eyebrow?: string | null
  text?: string | null
  ctaLabel?: string | null
  link?: string | null
  imageUrl?: string | null
  look?: BannerStyle
  tone?: BlockTone
  eager?: boolean
}
