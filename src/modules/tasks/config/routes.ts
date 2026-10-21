import type { IModuleRoute } from '../../../shared/bootstrap/contracts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const routes: IModuleRoute[] = [
  {
    name: 'cms-tasks',
    path: '/app/tasks',
    file: 'modules/tasks/views/tasks/Tasks.vue',
    layout: 'tasks',
    ssr: false,
    meta: { middleware: 'auth' },
  },
  {
    name: 'cms-task',
    path: '/app/tasks/:id',
    file: 'modules/tasks/views/task/Task.vue',
    layout: 'tasks',
    ssr: false,
    meta: { middleware: 'auth' },
  },
]
