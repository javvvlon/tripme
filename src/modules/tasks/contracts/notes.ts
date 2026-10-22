import type { IPerson, TaskStatus } from './tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const NOTE_KINDS = ['note', 'decision', 'directive'] as const

export type NoteKind = typeof NOTE_KINDS[number]

export type NoteFilter = 'all' | NoteKind | 'archive'

export type NoteState = 'active' | 'superseded' | 'archived' | 'draft'

export interface INoteRef {
  uuid: string
  key: string
}

export interface INoteAcks {
  total: number
  done: number
  mine: 'pending' | 'done' | null
}

export interface INote {
  uuid: string
  key: string
  kind: NoteKind
  title: string
  excerpt: string
  author: IPerson | null
  refs: string[]
  supersedes: INoteRef | null
  superseded_by: INoteRef | null
  acks: INoteAcks | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface INoteDetail extends INote {
  body: string
  rationale: string
  audience: Array<{ person: IPerson, acknowledged_at: string | null }>
  tasks: Array<{ uuid: string, key: string, title: string, status: TaskStatus }>
  notes: Array<INoteRef & { kind: NoteKind, title: string }>
}

export interface INoteDraft {
  kind: NoteKind
  title: string
  body: string
  rationale: string
  refs: string
  everyone: boolean
  audience: string[]
  supersedesId: string | null
}

export interface INotePatch {
  title?: string
  body?: string
  refs?: string[]
}

export interface IPendingDirective extends INoteRef {
  title: string
  author: IPerson | null
  created_at: string
}
