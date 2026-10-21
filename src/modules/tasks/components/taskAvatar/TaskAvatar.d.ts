import type { IPerson } from '~/modules/tasks/contracts/tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITaskAvatarProps {
  person: IPerson | null
  size?: 'sm' | 'md' | 'lg'
}
