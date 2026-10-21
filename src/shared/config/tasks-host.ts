/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const LOCALE = /^\/(ru|uz|en)(?=\/|$)/

const ALLOWED = /^\/(ru|uz|en)\/(app\/tasks|auth)(\/|$)/

const ASSET = /^\/(_|api\/)|\.[a-z0-9]+$/i

export const isTasksHost = (host: string | null | undefined): boolean =>
  ((host ?? '').toLowerCase().split(':')[0] ?? '').startsWith('tasks.')

export function tasksHostPath(path: string): string | null {
  if (ASSET.test(path) || ALLOWED.test(path)) return null

  return `/${path.match(LOCALE)?.[1] ?? 'ru'}/app/tasks`
}
