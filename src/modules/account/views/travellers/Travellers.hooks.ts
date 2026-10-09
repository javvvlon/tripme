import { useAccountRepository } from '~/modules/account/repositories'
import type { ITraveller, ITravellerDraft } from '~/modules/account/contracts/account'

interface ITravellerForm extends Omit<ITravellerDraft, 'birth_date' | 'passport_expires_at'> {
  birth_date: string
  passport_expires_at: string
}

const blank = (): ITravellerForm => ({
  first_name: '',
  last_name: '',
  birth_date: '',
  gender: '',
  citizenship: 'UZB',
  passport_number: '',
  passport_expires_at: '',
})

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTravellers = () => {
  const { t } = useI18n()
  const { failed, saved, loadFailed } = useToast()
  const { ask } = useConfirm()
  const { travellers, saveTraveller, removeTraveller } = useAccountRepository()

  const { data, status, error, refresh } = useAsyncData('account:travellers', () => travellers(), { default: () => [] as ITraveller[] })

  watch(error, (failure) => {
    if (failure) loadFailed(t('account.travellers.loadFailed'))
  })

  const open = ref(false)
  const editing = ref<string | null>(null)
  const busy = ref(false)
  const draft = reactive<ITravellerForm>(blank())

  const LATIN = /^[A-Za-z][A-Za-z' -]*$/

  const valid = computed(() => LATIN.test(draft.first_name.trim()) && LATIN.test(draft.last_name.trim()))

  function add() {
    Object.assign(draft, blank())
    editing.value = null
    open.value = true
  }

  function edit(traveller: ITraveller) {
    const { id, ...fields } = traveller

    Object.assign(draft, { ...fields, birth_date: fields.birth_date ?? '', passport_expires_at: fields.passport_expires_at ?? '' })
    editing.value = id
    open.value = true
  }

  async function save() {
    if (!valid.value || busy.value) return

    busy.value = true

    try {
      await saveTraveller({
        ...draft,
        birth_date: draft.birth_date || null,
        passport_expires_at: draft.passport_expires_at || null,
      }, editing.value ?? undefined)
      open.value = false
      saved(t('account.travellers.saved'))
      await refresh()
    }
    catch (e) {
      failed(e)
    }
    finally {
      busy.value = false
    }
  }

  async function remove(traveller: ITraveller) {
    if (!await ask({
      title: t('account.travellers.removeTitle'),
      subject: `${traveller.first_name} ${traveller.last_name}`,
      confirmLabel: t('account.travellers.remove'),
      tone: 'danger',
    })) return

    try {
      await removeTraveller(traveller.id)
      await refresh()
    }
    catch (e) {
      failed(e)
    }
  }

  return { travellers: data, status, open, editing, busy, draft, valid, add, edit, save, remove }
}
