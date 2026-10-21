import { isTasksHost, tasksHostPath } from '../../src/shared/config/tasks-host'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  if (event.method !== 'GET' || !isTasksHost(getRequestHost(event, { xForwardedHost: true }))) return

  const target = tasksHostPath(event.path.split('?')[0] ?? '/')

  if (target) return sendRedirect(event, target, 302)
})
