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
  /**
   * Removing or replacing also discards the stored file.
   *
   * Off by default: a picker whose `current` points at something it does not
   * own must not delete it. The CMS turns it on, because an image nothing
   * references is a bucket that only ever grows.
   */
  override?: boolean
  /** when given, the picker can also choose something already uploaded */
  library?: () => Promise<IMediaFile[]>
}

export interface IFileUploadEmits {
  /** the field is now empty — the caller should drop its stored URL */
  clear: []
  /** `override` only: this stored file is no longer referenced */
  discard: [url: string]
  /** an already-stored file was chosen from the library */
  pick: [url: string]
}
