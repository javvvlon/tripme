import { isTasksHost, tasksHostPath } from '~/shared/config/tasks-host'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin(() => {
  if (!isTasksHost(window.location.host)) return

  addRouteMiddleware('tasks-host', (to) => {
    const target = tasksHostPath(to.path)

    if (target) return navigateTo(target, { replace: true })
  }, { global: true })
})
