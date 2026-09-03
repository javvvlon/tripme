import { useOperatorsRepository } from '~/modules/operators/repositories'
import { OPERATOR_CONNECTIONS } from '~/modules/operators/contracts/operators'
import type { IOperatorDraft, IOperatorRaw, OperatorConnection } from '~/modules/operators/contracts/operators'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const blank = (): IOperatorDraft => ({
  name: '',
  connection: 'mirror',
  siteUrl: '',
  apiBaseUrl: '',
  apiLogin: '',
  apiKey: '',
  apiSecret: '',
  note: '',
})

export const useOperators = () => {
  const { t } = useI18n()
  const { saved: cheer, fail, loadFailed } = useToast()
  const { all, toggle, save } = useOperatorsRepository()

  const editing = ref<string | null>(null)
  const draft = reactive<IOperatorDraft>(blank())

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const { data, status, refresh } = useAsyncData(
    'cms:operators',
    () => all(),
    { default: () => [] as IOperatorRaw[] },
  )

  const connectionOptions = computed(() =>
    OPERATOR_CONNECTIONS.map(value => ({ value, label: t(`cms.operators.connections.${value}`) })))

  const counts = computed(() => {
    const rows = data.value ?? []

    return { total: rows.length, live: rows.filter(row => row.is_enabled).length }
  })

  function open(operator: IOperatorRaw) {
    Object.assign(draft, {
      name: operator.name,
      connection: operator.connection,
      siteUrl: operator.site_url,
      apiBaseUrl: operator.api_base_url,
      apiLogin: operator.api_login,
      apiKey: '',
      apiSecret: '',
      note: operator.note,
    })

    error.value = ''
    saved.value = false
    editing.value = operator.uuid
  }

  const current = computed(() =>
    (data.value ?? []).find(row => row.uuid === editing.value) ?? null)

  async function flip(operator: IOperatorRaw) {
    error.value = ''

    try {
      await toggle(operator.uuid, !operator.is_enabled)
      await refresh()
    }
    catch {
      error.value = fail(t('cms.errors.save'))
    }
  }

  async function submit() {
    if (!editing.value) return

    error.value = ''
    saving.value = true

    try {
      await save(editing.value, draft)
      await refresh()

      saved.value = true
      cheer()
      draft.apiKey = ''
      draft.apiSecret = ''
    }
    catch {
      error.value = fail(t('cms.errors.save'))
    }
    finally {
      saving.value = false
    }
  }

  return {
    operators: data, status, error, saving, saved,
    editing, current, draft, connectionOptions, counts,
    open, flip, submit, refresh,
  }
}
