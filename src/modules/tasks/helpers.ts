import type { TaskPriority } from './contracts/tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const initialsOf = (name: string | null | undefined): string =>
  (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]!.toUpperCase()).join('') || '—'

export const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

export const dueLabel = (due: string | null, locale: string): string =>
  due ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${due}T00:00:00Z`)) : ''

export const labelsOf = (value: string): string[] =>
  [...new Set(value.split(',').map(label => label.trim().toLowerCase()).filter(Boolean))]

const AVATAR_TONES = 8

export const avatarTone = (seed: string | null | undefined): number =>
  [...(seed ?? '')].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7) % AVATAR_TONES

export const refsOf = (value: string): string[] =>
  [...new Set(value.split(',').map(ref => ref.trim().toUpperCase()).filter(Boolean))]

export const noteTone = (note: { kind: string, archived_at: string | null, superseded_by: unknown, acks: { mine: string | null } | null }) => {
  if (note.archived_at) return 'archived' as const
  if (note.superseded_by) return 'superseded' as const
  if (note.acks?.mine === 'pending') return 'pending' as const

  return note.kind === 'note' ? null : 'active' as const
}

export const registerDate = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Tashkent' }).format(new Date(iso))
