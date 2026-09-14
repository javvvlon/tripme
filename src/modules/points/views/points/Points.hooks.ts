import { usePointsRepository } from '~/modules/points/repositories'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { POINTS_CURRENCIES } from '~/modules/points/contracts/points'
import type { IPointsOverview, IPointsTier, IPointsTierDraft, PointsCurrency } from '~/modules/points/contracts/points'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const blankTier = (): IPointsTierDraft => ({ name: '', threshold: '', discount_percent: '' })

export const usePoints = () => {
  const { t } = useI18n()
  const { failed, saved: cheer, loadFailed } = useToast()
  const { ask } = useConfirm()
  const { user } = useAuthSession()
  const { overview, saveRates, createTier, patchTier, removeTier } = usePointsRepository()

  const canManage = computed(() => user.value?.canSeeAllClients() ?? false)

  const { data, status, error, refresh } = useAsyncData<IPointsOverview>('cms:points', () => overview())

  watch(error, (failure) => {
    if (failure) loadFailed(t('cms.points.loadFailed'))
  })

  const tiers = computed(() => data.value?.tiers ?? [])

  const rates = reactive<Record<PointsCurrency, string>>({ USD: '', EUR: '', UZS: '' })

  watch(data, (next) => {
    if (!next) return

    for (const currency of POINTS_CURRENCIES) rates[currency] = String(next.rates[currency] ?? '')
  }, { immediate: true })

  const savingRates = ref(false)

  async function submitRates() {
    savingRates.value = true

    try {
      const body = Object.fromEntries(POINTS_CURRENCIES.map(currency => [currency, Number(rates[currency])]))

      await saveRates(body)
      await refresh()
      cheer()
    }
    catch (e) {
      failed(e)
    }
    finally {
      savingRates.value = false
    }
  }

  const editing = ref<string | 'new' | null>(null)
  const draft = reactive<IPointsTierDraft>(blankTier())
  const savingTier = ref(false)

  function edit(tier: IPointsTier | null) {
    Object.assign(draft, tier
      ? { name: tier.name, threshold: String(tier.threshold), discount_percent: String(tier.discount_percent) }
      : blankTier())

    editing.value = tier ? tier.id : 'new'
  }

  function cancel() {
    editing.value = null
  }

  async function submitTier() {
    if (!editing.value) return

    savingTier.value = true

    try {
      if (editing.value === 'new') await createTier(draft)
      else await patchTier(editing.value, draft)

      await refresh()
      editing.value = null
      cheer()
    }
    catch (e) {
      failed(e)
    }
    finally {
      savingTier.value = false
    }
  }

  async function remove(tier: IPointsTier) {
    const sure = await ask({
      title: t('cms.points.tiers.confirmDelete', { name: tier.name }),
      description: t('common.deleteWarning'),
      confirmLabel: t('common.delete'),
      tone: 'danger',
    })

    if (!sure) return

    try {
      await removeTier(tier.id)
      await refresh()
      cheer(t('cms.points.tiers.deleted'))
    }
    catch (e) {
      failed(e)
    }
  }

  return {
    status, tiers, canManage,
    rates, savingRates, submitRates,
    editing, draft, savingTier, edit, cancel, submitTier, remove,
  }
}
