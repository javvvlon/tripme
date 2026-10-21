/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const LOCALE = /^\/(ru|uz|en)(?=\/|$)/

const TASKS = /^\/(ru|uz|en)\/app\/tasks(\/|$)/

const ALLOWED = /^\/(ru|uz|en)\/(app\/tasks|auth)(\/|$)/

const ASSET = /^\/(_|api\/)|\.[a-z0-9]+$/i

const IP = /^\d{1,3}(\.\d{1,3}){3}$/

const hostname = (host: string | null | undefined): string => ((host ?? '').toLowerCase().split(':')[0] ?? '')

export const isTasksHost = (host: string | null | undefined): boolean => hostname(host).startsWith('tasks.')

export const isTasksPath = (path: string): boolean => TASKS.test(path)

export function tasksHostOf(host: string | null | undefined): string | null {
  const name = hostname(host)

  if (!name || IP.test(name) || name.endsWith('.vercel.app') || isTasksHost(host)) return null

  return `tasks.${(host ?? '').toLowerCase().replace(/^www\./, '')}`
}

export function tasksHostPath(path: string): string | null {
  if (ASSET.test(path) || ALLOWED.test(path)) return null

  return `/${path.match(LOCALE)?.[1] ?? 'ru'}/app/tasks`
}
