import { useAccountRepository } from '~/modules/account/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useCustomerOrder = () => {
  const { t } = useI18n()
  const { loadFailed, failed, saved } = useToast()
  const { ask } = useConfirm()
  const route = useRoute()
  const { order: fetchOrder, uploadDocument, removeDocument } = useAccountRepository()

  const id = computed(() => String(route.params.id ?? ''))

  const { data: order, status, error, refresh } = useAsyncData(
    () => `account:order:${id.value}`,
    () => fetchOrder(id.value),
  )

  const missing = computed(() => {
    const failure = error.value as { status?: number, statusCode?: number } | null

    return failure?.status === 404 || failure?.statusCode === 404
  })

  watch(error, (failure) => {
    if (failure && !missing.value) loadFailed(t('account.order.loadFailed'))
  })

  const history = computed(() => [...(order.value?.history ?? [])].reverse())

  const uploading = ref(false)

  async function upload(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    input.value = ''

    if (!file) return

    uploading.value = true

    try {
      await uploadDocument(id.value, file)
      saved(t('account.order.uploaded'))
      await refresh()
    }
    catch (e) {
      failed(e)
    }
    finally {
      uploading.value = false
    }
  }

  async function removeOwn(documentId: string, name: string) {
    if (!await ask({ title: t('account.order.removeFileTitle'), subject: name, confirmLabel: t('account.order.removeFile'), tone: 'danger' })) return

    try {
      await removeDocument(documentId)
      await refresh()
    }
    catch (e) {
      failed(e)
    }
  }

  return { order, status, missing, history, uploading, upload, removeOwn }
}
