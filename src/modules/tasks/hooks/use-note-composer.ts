import type { INoteRef, NoteKind } from '~/modules/tasks/contracts/notes'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useNoteComposer = () => {
  const open = useState('notes:composer', () => false)
  const kind = useState<NoteKind>('notes:composer-kind', () => 'note')
  const replacing = useState<INoteRef | null>('notes:composer-replacing', () => null)

  const start = (preset: NoteKind = 'note', previous: INoteRef | null = null) => {
    kind.value = preset
    replacing.value = previous
    open.value = true
  }

  return { open, kind, replacing, start }
}
