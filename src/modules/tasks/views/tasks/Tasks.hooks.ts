import { useTasksRepository } from '~/modules/tasks/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { TASK_STATUSES, TASK_VIEWS } from '~/modules/tasks/contracts/tasks'
import type { ITask, TaskStatus, TaskView } from '~/modules/tasks/contracts/tasks'

const SEARCH_DELAY_MS = 300

const UNASSIGNED = 'none'

export const TASK_FILTERS = ['all', 'mine', 'late'] as const

export type TaskFilter = typeof TASK_FILTERS[number]

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTasks = () => {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const { failed } = useToast()
  const { list, update } = useTasksRepository()
  const { elevated, me, people } = useManagers()

  const write = (patch: Record<string, string | undefined>) => {
    void router.replace({ query: { ...route.query, ...patch } })
  }

  const view = computed<TaskView>(() => {
    const value = String(route.query.view ?? '')

    return (TASK_VIEWS as readonly string[]).includes(value) ? value as TaskView : 'board'
  })

  const filter = computed<TaskFilter>({
    get: () => {
      const value = String(route.query.filter ?? '')

      return (TASK_FILTERS as readonly string[]).includes(value) ? value as TaskFilter : 'all'
    },
    set: (value) => { write({ filter: value === 'all' ? undefined : value }) },
  })

  const assignee = computed<string>({
    get: () => (typeof route.query.assignee === 'string' ? route.query.assignee : ''),
    set: (value) => { write({ assignee: value || undefined }) },
  })

  const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
  const search = ref(query.value)

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (value) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { search.value = value.trim() }, SEARCH_DELAY_MS)
  })

  const { data: tasks, status } = useAsyncData(
    'cms:tasks',
    () => list({ q: search.value, mine: view.value === 'mine', archived: view.value === 'archive' }),
    { default: () => [] as ITask[], watch: [search, view] },
  )

  const visible = computed(() => tasks.value.filter(task =>
    (filter.value !== 'mine' || task.assignee?.uuid === me.value)
    && (filter.value !== 'late' || task.overdue)
    && (!assignee.value || (assignee.value === UNASSIGNED ? !task.assignee : task.assignee?.uuid === assignee.value))))

  const columns = computed(() => TASK_STATUSES.map(value => ({
    status: value,
    items: visible.value.filter(task => task.status === value),
  })))

  const open = computed(() => tasks.value.filter(task => task.status !== 'done').length)

  const late = computed(() => tasks.value.filter(task => task.overdue).length)

  const personOptions = computed(() => [
    { value: '', label: t('cms.tasks.filters.everyone') },
    { value: UNASSIGNED, label: t('cms.tasks.filters.unassigned') },
    ...(people.value ?? []).map(person => ({ value: person.uuid, label: person.name })),
  ])

  const filtered = computed(() => Boolean(filter.value !== 'all' || assignee.value || search.value))

  const clear = () => {
    query.value = ''
    search.value = ''
    write({ filter: undefined, assignee: undefined })
  }

  const replaceTask = (next: ITask) => {
    tasks.value = tasks.value.map(task => (task.uuid === next.uuid ? next : task))
  }

  async function move(task: ITask, target: TaskStatus) {
    if (task.status === target) return

    replaceTask({ ...task, status: target })

    try {
      replaceTask(await update(task.uuid, { status: target }))
    }
    catch (e) {
      replaceTask(task)
      failed(e)
    }
  }

  return { view, filter, assignee, query, tasks, visible, status, columns, open, late, personOptions, filtered, clear, move, elevated }
}
