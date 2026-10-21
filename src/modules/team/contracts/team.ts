/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const TEAM_ROLES = ['AGENT', 'MANAGER', 'ADMIN'] as const

export type TeamRole = typeof TEAM_ROLES[number]

export interface ITeamMember {
  uuid: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: TeamRole
  archived_at: string | null
  last_seen_at: string | null
  open_leads: number
  open_orders: number
  created_at: string
}

export interface IMemberDraft {
  email: string
  firstName: string
  lastName: string
  phone: string
  role: TeamRole
}

export interface IMyWork {
  free_leads: number
  unanswered_leads: number
  draft_orders: number
  requested_orders: number
  unread_messages: number
}

export type WorkKey = keyof IMyWork
