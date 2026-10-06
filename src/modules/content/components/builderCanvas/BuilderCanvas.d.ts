import type { ContentLocale } from '~/modules/content/contracts/content'
import type { ContentPage, SectionKind } from '~/modules/content/contracts/blocks'
import type { BlockAction, DeviceKind, IBuilderContext, IFrameSection } from '~/modules/content/contracts/builder'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBuilderCanvasProps {
  page: ContentPage
  sections: IFrameSection[]
  context: IBuilderContext
  locale: ContentLocale
  selected: string | null
  problems: Record<string, string>
  device: DeviceKind
  clean: boolean
  label: string
}

export interface IBuilderCanvasEmits {
  select: [key: string | null]
  action: [key: string, action: BlockAction]
  move: [key: string, to: number]
  insert: [kind: SectionKind, index: number]
  ready: []
}
