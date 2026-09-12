/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
import type { IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'

export interface IFileUploadProps {
  id?: string
  accept?: string[]
  maxSize?: number
  maxWidth?: number
  maxHeight?: number
  hint?: string
  current?: string | null
  disabled?: boolean
  override?: boolean
  library?: () => Promise<IMediaFile[]>
}

export interface IFileUploadEmits {
  clear: []
  discard: [url: string]
  pick: [url: string]
}
