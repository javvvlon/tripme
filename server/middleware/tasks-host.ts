import { TASKS_PATH, tasksHostTarget } from '../../src/shared/config/tasks-host'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineEventHandler((event) => {
  const target = tasksHostTarget(getRequestHost(event, { xForwardedHost: true }))

  if (target) return sendRedirect(event, `${target}${TASKS_PATH}`, 302)
})
