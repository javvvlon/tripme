import type { AnyObject } from '~/shared/contracts/data'
import { refsOf } from '../helpers'
import type { INote, INoteDetail, INoteDraft, INotePatch, IPendingDirective, NoteFilter } from '../contracts/notes'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useNotesRepository = () => {
  const http = useHttp()

  const list = async (filter: NoteFilter, q: string): Promise<INote[]> => {
    const params: Record<string, string> = {}

    if (filter === 'archive') params.archived = '1'
    else if (filter !== 'all') params.kind = filter
    if (q) params.q = q

    return (await http.call<INote[]>('Tasks', 'notes', params)).data ?? []
  }

  const pending = async (): Promise<IPendingDirective[]> => (await http.call<IPendingDirective[]>('Tasks', 'pendingNotes')).data ?? []

  const one = async (id: string): Promise<INoteDetail> => (await http.call<INoteDetail>('Tasks', 'note', { id })).data

  const create = async (draft: INoteDraft): Promise<INoteDetail> =>
    (await http.call<INoteDetail>('Tasks', 'createNote', {}, {
      kind: draft.kind,
      title: draft.title.trim(),
      body: draft.body.trim(),
      rationale: draft.rationale.trim(),
      refs: refsOf(draft.refs),
      audience: draft.everyone ? 'all' : draft.audience,
      supersedes_id: draft.supersedesId,
    } as AnyObject)).data

  const update = async (id: string, patch: INotePatch): Promise<INoteDetail> =>
    (await http.call<INoteDetail>('Tasks', 'updateNote', { id }, patch as AnyObject)).data

  const acknowledge = async (id: string): Promise<INoteDetail> => (await http.call<INoteDetail>('Tasks', 'ackNote', { id })).data

  const archive = async (id: string): Promise<INoteDetail> => (await http.call<INoteDetail>('Tasks', 'archiveNote', { id })).data

  const restore = async (id: string): Promise<INoteDetail> => (await http.call<INoteDetail>('Tasks', 'restoreNote', { id })).data

  return { list, pending, one, create, update, acknowledge, archive, restore }
}
