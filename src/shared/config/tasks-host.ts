/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const TASKS_PATH = '/ru/app/tasks'

export function tasksHostTarget(host: string | null | undefined): string | null {
  const name = (host ?? '').toLowerCase().split(':')[0] ?? ''

  if (!name.startsWith('tasks.')) return null

  return `https://www.${name.slice('tasks.'.length)}`
}
