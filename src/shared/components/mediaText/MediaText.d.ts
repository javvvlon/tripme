import type { ImageSide } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMediaTextProps {
  title: string
  body?: string | null
  ctaLabel?: string | null
  link?: string | null
  imageUrl?: string | null
  side?: ImageSide
  eager?: boolean
}
