import type { ITask, TaskStatus } from '~/modules/tasks/contracts/tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTaskComposer = () => {
  const open = useState('tasks:composer', () => false)
  const preset = useState<TaskStatus | null>('tasks:composer-status', () => null)
  const last = useState<ITask | null>('tasks:composer-last', () => null)

  const start = (status?: TaskStatus) => {
    preset.value = status ?? null
    open.value = true
  }

  return { open, preset, last, start }
}
