import type { ContentLocale } from './content'
import type { ContentPage, IContentLayoutRaw, IContentListRaw, ISectionDraft, SectionKind } from './blocks'
import type { IPostRaw } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const BUILDER_CHANNEL = 'tm-builder'

export const BLOCK_DRAG_TYPE = 'application/x-tm-block'

export const DEVICES = {
  desktop: { width: 1280, icon: 'desktop' },
  tablet: { width: 820, icon: 'tablet' },
  mobile: { width: 390, icon: 'mobile' },
} as const

export type DeviceKind = keyof typeof DEVICES

export type BlockAction = 'up' | 'down' | 'duplicate' | 'toggle' | 'remove'

export interface IBuilderContext {
  layouts: IContentLayoutRaw[]
  lists: IContentListRaw[]
  posts: IPostRaw[]
}

export type IFrameSection = ISectionDraft & { key: string }

export type ParentMessage =
  | { channel: typeof BUILDER_CHANNEL, type: 'context', page: ContentPage, context: IBuilderContext }
  | {
    channel: typeof BUILDER_CHANNEL
    type: 'render'
    locale: ContentLocale
    sections: IFrameSection[]
    selected: string | null
    problems: Record<string, string>
    clean: boolean
    zoom: number
  }
  | { channel: typeof BUILDER_CHANNEL, type: 'reveal', key: string }

export type FrameMessage =
  | { channel: typeof BUILDER_CHANNEL, type: 'ready' }
  | { channel: typeof BUILDER_CHANNEL, type: 'height', value: number }
  | { channel: typeof BUILDER_CHANNEL, type: 'select', key: string | null }
  | { channel: typeof BUILDER_CHANNEL, type: 'action', key: string, action: BlockAction }
  | { channel: typeof BUILDER_CHANNEL, type: 'move', key: string, to: number }
  | { channel: typeof BUILDER_CHANNEL, type: 'insert', kind: SectionKind, index: number }
  | { channel: typeof BUILDER_CHANNEL, type: 'revealed', top: number }

type Payload<T> = T extends { channel: string } ? Omit<T, 'channel'> : never

export type ParentPayload = Payload<ParentMessage>

export type FramePayload = Payload<FrameMessage>

export const isBuilderMessage = <T extends { channel: string }>(data: unknown): data is T =>
  typeof data === 'object' && data !== null && (data as { channel?: unknown }).channel === BUILDER_CHANNEL
