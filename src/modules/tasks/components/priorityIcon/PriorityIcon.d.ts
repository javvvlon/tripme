import type { TaskPriority } from '~/modules/tasks/contracts/tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPriorityIconProps {
  priority: TaskPriority
  size?: number
}
