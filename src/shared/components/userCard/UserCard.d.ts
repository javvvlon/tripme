/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IUserCardProps {
  name: string
  role?: string
  avatar?: string | null
  compact?: boolean
  to?: string
  actionLabel?: string
  actionIcon?: string
}
