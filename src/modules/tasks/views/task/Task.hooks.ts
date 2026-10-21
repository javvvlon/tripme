import { useTasksRepository } from '~/modules/tasks/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import type { ITaskDetail, ITaskPatch } from '~/modules/tasks/contracts/tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTask = () => {
  const route = useRoute()
  const { failed } = useToast()
  const { one, update, comment, archive, restore } = useTasksRepository()
  const { elevated, me, people, assignOptions } = useManagers()

  const id = computed(() => String(route.params.id ?? ''))

  const { data: task, status, refresh } = useAsyncData(
    () => `cms:task:${id.value}`,
    () => one(id.value),
    { default: () => null as ITaskDetail | null },
  )

  const saving = ref(false)
  const sending = ref(false)

  async function save(patch: ITaskPatch) {
    if (!task.value || saving.value) return

    saving.value = true

    try {
      await update(task.value.uuid, patch)
      await refresh()
    }
    catch (e) {
      failed(e)
    }
    finally {
      saving.value = false
    }
  }

  async function send(body: string): Promise<boolean> {
    if (!task.value || !body.trim() || sending.value) return false

    sending.value = true

    try {
      await comment(task.value.uuid, body.trim())
      await refresh()

      return true
    }
    catch (e) {
      failed(e)

      return false
    }
    finally {
      sending.value = false
    }
  }

  async function toggleArchive() {
    if (!task.value) return

    try {
      await (task.value.archived_at ? restore(task.value.uuid) : archive(task.value.uuid))
      await refresh()
    }
    catch (e) {
      failed(e)
    }
  }

  const nameOf = (uuid: string | null): string => {
    if (!uuid) return ''

    return (people.value ?? []).find(person => person.uuid === uuid)?.name ?? '—'
  }

  return { task, status, saving, sending, save, send, toggleArchive, elevated, me, assignOptions, nameOf }
}
