/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type NoteStampTone = 'active' | 'superseded' | 'archived' | 'pending' | 'acknowledged'

export interface INoteStampProps {
  tone: NoteStampTone
  size?: 'sm' | 'md'
}
