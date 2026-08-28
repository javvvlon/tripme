/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMarkdownEditorProps {
  label?: string
  hint?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}

export interface IMarkdownAction {
  key: string
  icon: string
  before: string
  after: string
  block?: boolean
}
