import { isTasksHost, isTasksPath, tasksHostOf, tasksHostPath } from '../../src/shared/config/tasks-host'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  if (event.method !== 'GET') return

  const host = getRequestHost(event, { xForwardedHost: true })
  const path = event.path.split('?')[0] ?? '/'

  if (isTasksHost(host)) {
    const target = tasksHostPath(path)

    return target ? sendRedirect(event, target, 302) : undefined
  }

  const tasksHost = tasksHostOf(host)

  if (tasksHost && isTasksPath(path)) {
    return sendRedirect(event, `${getRequestProtocol(event, { xForwardedProto: true })}://${tasksHost}${event.path}`, 302)
  }
})
