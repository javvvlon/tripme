import { useEsimRepository } from '~/modules/esim/repositories'
import { sumOf } from '~/modules/esim/helpers/esim'
import type { IEsimPurchase } from '~/modules/esim/contracts/esim'

type PayStep = 'details' | 'secure'

const TEST_CARD = '4111 1111 1111 1111'
const DECLINE_CODE = '000000'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimPay = () => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()
  const { failed } = useToast()
  const { purchase, sandboxPay } = useEsimRepository()

  const token = computed(() => String(route.params.token ?? ''))
  const order = ref<IEsimPurchase | null>(null)
  const step = ref<PayStep>('details')
  const busy = ref(false)
  const card = reactive({ number: TEST_CARD, expiry: '12/29', cvc: '123' })
  const code = ref('')

  onMounted(async () => {
    try {
      order.value = await purchase(token.value)

      if (order.value.status !== 'awaiting_payment') await toOrder()
    }
    catch (e) {
      failed(e)
    }
  })

  const amount = computed(() => (order.value ? sumOf(order.value.price_uzs, locale.value, t('esim.sum')) : ''))
  const method = computed(() => order.value?.method ?? 'card')

  const cardValid = computed(() =>
    card.number.replace(/\D/g, '').length === 16 && /^\d{2}\/\d{2}$/.test(card.expiry) && /^\d{3}$/.test(card.cvc))

  const toOrder = () => navigateTo(localePath(`/esim/order/${token.value}`))

  async function finish(outcome: 'paid' | 'failed') {
    busy.value = true

    try {
      await sandboxPay(token.value, outcome)
      await toOrder()
    }
    catch (e) {
      failed(e)
      busy.value = false
    }
  }

  function submitCard() {
    if (!cardValid.value) return

    step.value = 'secure'
  }

  const submitCode = () => finish(code.value === DECLINE_CODE ? 'failed' : 'paid')

  return { order, step, busy, card, code, amount, method, cardValid, finish, submitCard, submitCode }
}
