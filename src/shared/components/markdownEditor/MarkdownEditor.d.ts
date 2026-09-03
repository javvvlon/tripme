/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
import type { IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'

export interface IMarkdownEditorProps {
  label?: string
  hint?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  uploader?: (file: File) => Promise<string>
  library?: (query?: string, folder?: string) => Promise<IMediaFile[]>
}

export interface IMarkdownAction {
  key: string
  icon: string
  before: string
  after: string
  block?: boolean
}
