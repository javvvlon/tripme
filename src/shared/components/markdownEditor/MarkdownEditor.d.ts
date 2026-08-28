/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMediaFile {
  url: string
  path: string
}

export interface IMarkdownEditorProps {
  label?: string
  hint?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  uploader?: (file: File) => Promise<string>
  library?: () => Promise<IMediaFile[]>
}

export interface IMarkdownAction {
  key: string
  icon: string
  before: string
  after: string
  block?: boolean
}
