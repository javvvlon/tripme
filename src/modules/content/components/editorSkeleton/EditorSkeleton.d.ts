/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type EditorSkeletonVariant = 'form' | 'cards' | 'rows'

export interface IEditorSkeletonProps {
  variant: EditorSkeletonVariant
  count?: number
  label?: string
}
