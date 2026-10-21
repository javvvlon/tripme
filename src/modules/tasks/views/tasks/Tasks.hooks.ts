import { useTasksRepository } from '~/modules/tasks/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { TASK_STATUSES, TASK_VIEWS } from '~/modules/tasks/contracts/tasks'
import type { IPerson, ITask, TaskStatus, TaskView } from '~/modules/tasks/contracts/tasks'

const SEARCH_DELAY_MS = 300

const UNASSIGNED = 'none'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTasks = () => {
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

  const selected = computed<string[]>({
    get: () => String(route.query.assignee ?? '').split(',').filter(Boolean),
    set: (value) => { write({ assignee: value.join(',') || undefined }) },
  })

  const lateOnly = computed<boolean>({
    get: () => route.query.late === '1',
    set: (value) => { write({ late: value ? '1' : undefined }) },
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
    (!selected.value.length || selected.value.includes(task.assignee?.uuid ?? UNASSIGNED))
    && (!lateOnly.value || task.overdue)))

  const columns = computed(() => TASK_STATUSES.map(value => ({
    status: value,
    items: visible.value.filter(task => task.status === value),
  })))

  const team = computed<IPerson[]>(() => {
    const everyone = (people.value ?? []).map(person => ({ uuid: person.uuid, name: person.name }))

    return [...everyone.filter(person => person.uuid === me.value), ...everyone.filter(person => person.uuid !== me.value)]
  })

  const toggle = (uuid: string) => {
    selected.value = selected.value.includes(uuid) ? selected.value.filter(entry => entry !== uuid) : [...selected.value, uuid]
  }

  const filtered = computed(() => Boolean(selected.value.length || lateOnly.value || search.value))

  const clear = () => {
    query.value = ''
    search.value = ''
    write({ assignee: undefined, late: undefined })
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

  return { view, query, tasks, visible, status, columns, team, selected, lateOnly, toggle, filtered, clear, move, elevated, UNASSIGNED }
}
