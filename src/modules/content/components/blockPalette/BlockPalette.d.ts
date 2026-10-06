import type { SectionKind } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBlockPaletteProps {
  kinds: SectionKind[]
  label: string
}

export interface IBlockPaletteEmits {
  add: [kind: SectionKind]
}
