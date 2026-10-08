import { useEsimRepository } from '~/modules/esim/repositories'
import { ESIM_PURCHASE_STATUSES } from '~/modules/esim/contracts/esim'
import type { IEsimPurchaseRow } from '~/modules/esim/contracts/esim'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimPurchases = () => {
  const { t } = useI18n()
  const { failed, saved } = useToast()
  const { purchases, retry } = useEsimRepository()
  const { page, perPage, pageQuery, setPage, setPerPage, toFirst } = usePageQuery()

  const query = ref('')
  const filter = ref('')
  const debounced = ref('')
  const retrying = ref('')

  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, (next) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => { debounced.value = next.trim() }, 300)
  })

  watch([debounced, filter], toFirst)

  const { data, status, refresh } = useAsyncData(
    'cms:esim',
    () => purchases({ page: pageQuery.value.page, per_page: pageQuery.value.perPage, status: filter.value || undefined, q: debounced.value || undefined }),
    { default: () => null, watch: [debounced, filter, pageQuery] },
  )

  const rows = computed<IEsimPurchaseRow[]>(() => data.value?.items ?? [])
  const pages = computed(() => data.value?.pages ?? 1)
  const total = computed(() => data.value?.total ?? 0)

  const counts = computed(() => {
    const raw = data.value?.counts ?? {}

    return {
      issued: raw.issued ?? 0,
      failed: raw.issue_failed ?? 0,
    }
  })

  const filterOptions = computed(() => [
    { value: '', label: t('cms.esim.filters.all') },
    ...ESIM_PURCHASE_STATUSES.map(value => ({ value, label: t(`cms.esim.status.${value}`) })),
  ])

  async function issueAgain(row: IEsimPurchaseRow) {
    retrying.value = row.id

    try {
      const next = await retry(row.id)

      saved(next.status === 'issued' ? t('cms.esim.retried') : t('cms.esim.retryFailed'))
      await refresh()
    }
    catch (e) {
      failed(e)
    }
    finally {
      retrying.value = ''
    }
  }

  onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

  return {
    rows, status, query, filter, filterOptions, counts, retrying, issueAgain,
    page, pages, total, perPage, setPage, setPerPage,
  }
}
