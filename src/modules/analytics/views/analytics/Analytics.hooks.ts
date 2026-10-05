import { useAnalyticsRepository } from '~/modules/analytics/repositories'
import type { AnalyticsPreset, IAnalyticsKpis, IAnalyticsReport } from '~/modules/analytics/contracts/analytics'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PRESETS: AnalyticsPreset[] = ['7', '30', '90', '365']

const DAY = 86_400_000

const tashkentToday = (): string => new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10)

const shift = (day: string, days: number): string =>
  new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10)

export type DeltaTone = 'good' | 'bad' | 'flat'

export interface IDelta {
  text: string
  tone: DeltaTone
}

export const useAnalytics = () => {
  const route = useRoute()
  const router = useRouter()
  const { report } = useAnalyticsRepository()
  const { loadFailed } = useToast()
  const { t } = useI18n()

  const preset = computed<AnalyticsPreset>({
    get: () => (PRESETS.includes(route.query.days as AnalyticsPreset) ? route.query.days as AnalyticsPreset : '30'),
    set: (value) => { void router.replace({ query: { ...route.query, days: value } }) },
  })

  const range = computed(() => {
    const to = tashkentToday()

    return { from: shift(to, -(Number(preset.value) - 1)), to }
  })

  const data = ref<IAnalyticsReport | null>(null)
  const pending = ref(true)

  async function load() {
    pending.value = true

    try {
      data.value = await report(range.value.from, range.value.to)
    }
    catch {
      loadFailed(t('cms.errors.load'))
    }
    finally {
      pending.value = false
    }
  }

  watch(range, load, { immediate: true })

  const delta = (key: keyof IAnalyticsKpis, higherIsBetter = true): IDelta | null => {
    const now = data.value?.kpis.current[key]
    const before = data.value?.kpis.previous[key]

    if (now === null || now === undefined || before === null || before === undefined) return null
    if (before === 0 && now === 0) return { text: '0%', tone: 'flat' }
    if (before === 0) return { text: t('cms.analytics.new'), tone: higherIsBetter ? 'good' : 'bad' }

    const change = (now - before) / Math.abs(before)
    const rounded = Math.round(change * 100)

    if (rounded === 0) return { text: '0%', tone: 'flat' }

    const better = (rounded > 0) === higherIsBetter

    return { text: `${rounded > 0 ? '+' : ''}${rounded}%`, tone: better ? 'good' : 'bad' }
  }

  return { preset, range, data, pending, delta, reload: load }
}
