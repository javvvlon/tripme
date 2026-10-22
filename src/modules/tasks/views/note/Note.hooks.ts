import { useNotesRepository } from '~/modules/tasks/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import type { INoteDetail, INotePatch } from '~/modules/tasks/contracts/notes'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useNote = () => {
  const route = useRoute()
  const { failed } = useToast()
  const { one, update, acknowledge, archive, restore } = useNotesRepository()
  const { elevated, me } = useManagers()

  const id = computed(() => String(route.params.id ?? ''))

  const { data: note, status } = useAsyncData(
    () => `notes:one:${id.value}`,
    () => one(id.value),
    { default: () => null as INoteDetail | null },
  )

  const busy = ref(false)

  async function run(action: () => Promise<INoteDetail>): Promise<boolean> {
    if (busy.value) return false

    busy.value = true

    try {
      note.value = await action()
      await refreshNuxtData(['notes:list', 'notes:pending'])

      return true
    }
    catch (e) {
      failed(e)

      return false
    }
    finally {
      busy.value = false
    }
  }

  const save = (patch: INotePatch) => run(() => update(id.value, patch))

  const confirm = () => run(() => acknowledge(id.value))

  const toggleArchive = () => run(() => (note.value?.archived_at ? restore(id.value) : archive(id.value)))

  return { note, status, busy, save, confirm, toggleArchive, elevated, me }
}
