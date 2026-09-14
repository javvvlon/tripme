import { usePointsRepository } from '~/modules/points/repositories'
import type { IMyPoints } from '~/modules/points/contracts/points'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMyPoints = () => {
  const { t } = useI18n()
  const { loadFailed } = useToast()
  const { mine } = usePointsRepository()

  const { data, status, error } = useAsyncData<IMyPoints>('account:points', () => mine())

  watch(error, (failure) => {
    if (failure) loadFailed(t('account.points.loadFailed'))
  })

  const progress = computed(() => {
    const summary = data.value?.summary

    if (!summary?.next) return 100

    const floor = summary.tier?.threshold ?? 0
    const span = summary.next.threshold - floor

    return span > 0 ? Math.min(100, Math.round(((summary.balance - floor) / span) * 100)) : 0
  })

  return { data, status, progress }
}
