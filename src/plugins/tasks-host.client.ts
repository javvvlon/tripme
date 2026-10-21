import { isTasksHost, isTasksPath, tasksHostOf, tasksHostPath } from '~/shared/config/tasks-host'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin(() => {
  const onTasks = isTasksHost(window.location.host)
  const tasksHost = tasksHostOf(window.location.host)

  if (!onTasks && !tasksHost) return

  addRouteMiddleware('tasks-host', (to) => {
    if (onTasks) {
      const target = tasksHostPath(to.path)

      return target ? navigateTo(target, { replace: true }) : undefined
    }

    if (isTasksPath(to.path)) {
      return navigateTo(`${window.location.protocol}//${tasksHost}${to.fullPath}`, { external: true, replace: true })
    }
  }, { global: true })
})
