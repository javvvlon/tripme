import { usePointsRepository } from '~/modules/points/repositories'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { ICustomerPoints } from '~/modules/points/contracts/points'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useCustomerPoints = (userId: () => string) => {
  const { t } = useI18n()
  const { failed, saved: cheer, loadFailed } = useToast()
  const { user } = useAuthSession()
  const { customer, adjust: send } = usePointsRepository()

  const canManage = computed(() => user.value?.canSeeAllClients() ?? false)

  const { data, status, error, refresh } = useAsyncData<ICustomerPoints>(
    () => `cms:points:${userId()}`,
    () => customer(userId()),
  )

  watch(error, (failure) => {
    if (failure) loadFailed(t('cms.points.customer.loadFailed'))
  })

  const adjusting = ref(false)
  const draft = reactive({ direction: 'add' as 'add' | 'take', amount: '' as string | number, note: '' })
  const saving = ref(false)
  const formError = ref('')

  function open() {
    draft.direction = 'add'
    draft.amount = ''
    draft.note = ''
    formError.value = ''
    adjusting.value = true
  }

  async function submit() {
    const amount = Math.trunc(Number(draft.amount))

    if (!Number.isFinite(amount) || amount <= 0) {
      formError.value = t('cms.points.customer.amountRequired')

      return
    }

    saving.value = true
    formError.value = ''

    try {
      data.value = await send(userId(), draft.direction === 'add' ? amount : -amount, draft.note)
      adjusting.value = false
      cheer(t('cms.points.customer.adjusted'))
    }
    catch (e) {
      formError.value = failed(e, t('cms.points.customer.adjustFailed'))
    }
    finally {
      saving.value = false
    }
  }

  return { data, status, canManage, adjusting, draft, saving, formError, open, submit, refresh }
}
