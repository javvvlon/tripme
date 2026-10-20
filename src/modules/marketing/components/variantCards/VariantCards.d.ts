import type { IAdCopy } from '../../contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IVariantCardsProps {
  variants: IAdCopy[]
  current?: IAdCopy
  busy: boolean
  ai: boolean
  generation: number
  mode?: 'banner' | 'post'
  picking?: number | null
}

export interface IVariantCardsEmits {
  pick: [index: number]
  generate: []
}
