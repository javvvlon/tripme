import type { WorkKey } from '~/modules/team/contracts/team'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IWorkTile {
  key: WorkKey
  icon: string
  to: string
  query?: Record<string, string>
  urgent?: boolean
}

export const WORK_TILES: IWorkTile[] = [
  { key: 'free_leads', icon: 'users', to: '/app/leads', query: { manager: 'none' }, urgent: true },
  { key: 'unanswered_leads', icon: 'clock', to: '/app/leads', query: { manager: 'me' }, urgent: true },
  { key: 'unread_messages', icon: 'mail', to: '/app/messages', urgent: true },
  { key: 'requested_orders', icon: 'plane', to: '/app/orders', query: { manager: 'me', status: 'requested' } },
  { key: 'draft_orders', icon: 'pencil', to: '/app/orders', query: { manager: 'me', status: 'draft' } },
]

export const WORK_REFRESH_MS = 60000
