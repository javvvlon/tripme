import { useContentRepository } from '~/modules/content/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLists = () => {
  const { t } = useI18n()
  const { failed, saved: cheer, fail, loadFailed } = useToast()
  const { ask } = useConfirm()
  const { lists, createList, deleteList } = useContentRepository()

  const error = ref('')
  const busy = ref(false)

  const { data, status, refresh } = useAsyncData('cms:lists', () => lists(), { default: () => [] })

  async function create() {
    busy.value = true
    error.value = ''

    try {
      const { uuid } = await createList({ name: t('cms.lists.untitled'), items: [] })

      await navigateTo(useLocalePath()(`/app/content/lists/${uuid}`))
    }
    catch {
      error.value = fail(t('cms.errors.save'))
    }
    finally {
      busy.value = false
    }
  }

  async function remove(id: string, name?: string) {
    if (!await ask({
      title: t('cms.lists.confirmDelete.title'),
      description: t('cms.lists.confirmDelete.lead'),
      subject: name || undefined,
    })) return

    error.value = ''

    try {
      await deleteList(id)
      await refresh()
    }
    catch (e) {
      error.value = failed(e)
    }
  }

  return { lists: data, status, error, busy, create, remove, refresh }
}
