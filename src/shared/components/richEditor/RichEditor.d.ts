/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
import type { IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'

export interface IRichEditorProps {
  placeholder?: string
  hint?: string
  disabled?: boolean
  compact?: boolean
  uploader?: (file: File) => Promise<string>
  library?: (query?: string, folder?: string) => Promise<IMediaFile[]>
}

export interface IRichTool {
  key: string
  icon?: string
  text?: string
  compact?: boolean
}

export type RichAsk = 'link' | 'video' | null
