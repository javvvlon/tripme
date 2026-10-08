import { renderSVG } from 'uqr'
import { useEsimRepository } from '~/modules/esim/repositories'
import { countryName, flagOf, sumOf } from '~/modules/esim/helpers/esim'
import type { IEsimPurchase } from '~/modules/esim/contracts/esim'

const WAITING = ['awaiting_payment', 'paid']
const POLL_MS = 3000
const POLL_LIMIT = 200

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimOrder = () => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const { purchase } = useEsimRepository()
  const { saved } = useToast()

  const token = computed(() => String(route.params.token ?? ''))
  const order = ref<IEsimPurchase | null>(null)
  const missing = ref(false)
  const device = ref<'ios' | 'android'>('ios')

  let timer: ReturnType<typeof setTimeout> | null = null
  let polls = 0

  async function load() {
    try {
      order.value = await purchase(token.value)
      missing.value = false
    }
    catch {
      if (!order.value) missing.value = true
    }

    if (order.value && WAITING.includes(order.value.status) && polls < POLL_LIMIT) {
      polls += 1
      timer = setTimeout(load, POLL_MS)
    }
  }

  onMounted(load)
  onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

  const qr = computed(() => (order.value?.esim?.lpa ? renderSVG(order.value.esim.lpa, { border: 1 }) : ''))

  const summary = computed(() => {
    const value = order.value

    if (!value) return ''

    const volume = value.plan.data_gb === null ? t('esim.unlimited') : t('esim.gb', { n: value.plan.data_gb })

    return `${flagOf(value.country)} ${countryName(value.country, locale.value)} · ${volume} · ${t('esim.days', { n: value.plan.days }, value.plan.days)}`
  })

  const price = computed(() => (order.value ? sumOf(order.value.price_uzs, locale.value, t('esim.sum')) : ''))

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      saved(t('esim.order.copied'))
    }
    catch {
      return
    }
  }

  return { order, missing, qr, summary, price, device, copy }
}
