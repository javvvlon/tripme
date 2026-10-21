import { TASKS_PATH, tasksHostTarget } from '~/shared/config/tasks-host'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin(() => {
  const target = tasksHostTarget(window.location.host)

  if (target) window.location.replace(`${target}${TASKS_PATH}`)
})
