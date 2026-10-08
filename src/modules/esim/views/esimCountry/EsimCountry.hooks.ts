import { useEsimRepository } from '~/modules/esim/repositories'
import { countryName, flagOf, sumOf } from '~/modules/esim/helpers/esim'
import { ESIM_PAYMENT_METHODS } from '~/modules/esim/contracts/esim'
import { isCompletePhone, toE164 } from '~/shared/helpers/phone'
import type { EsimPaymentMethod, IEsimPlan } from '~/modules/esim/contracts/esim'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimCountry = () => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const { failed } = useToast()
  const { plans, methods, checkout } = useEsimRepository()

  const code = computed(() => String(route.params.country ?? '').toUpperCase())

  const { data, status, error } = useAsyncData(
    () => `esim:plans:${code.value}`,
    () => plans(code.value),
    { default: () => [] as IEsimPlan[] },
  )

  const { data: available } = useAsyncData('esim:methods', () => methods(), { default: () => [], lazy: true, server: false })

  const selected = ref('')
  const email = ref('')
  const phone = ref('')
  const method = ref<EsimPaymentMethod>('payme')
  const touched = ref(false)
  const busy = ref(false)

  watch(data, (next) => {
    if (!next.some(plan => plan.id === selected.value)) {
      selected.value = next.find(plan => plan.data_gb !== null && plan.data_gb >= 3)?.id ?? next[0]?.id ?? ''
    }
  }, { immediate: true })

  const name = computed(() => countryName(code.value, locale.value))
  const flag = computed(() => flagOf(code.value))
  const networks = computed(() => [...new Set(data.value.flatMap(plan => plan.networks))].join(', '))

  const sum = (value: number) => sumOf(value, locale.value, t('esim.sum'))

  const volume = (plan: IEsimPlan) => (plan.data_gb === null ? t('esim.unlimited') : t('esim.gb', { n: plan.data_gb }))

  const cards = computed(() => data.value.map(plan => ({
    ...plan,
    volume: volume(plan),
    period: t('esim.days', { n: plan.days }, plan.days),
    price: sum(plan.price_uzs),
    perDay: t('esim.perDay', { price: sum(Math.round(plan.price_uzs / plan.days / 100) * 100) }),
  })))

  const plan = computed(() => cards.value.find(entry => entry.id === selected.value) ?? null)

  const methodOptions = computed(() => ESIM_PAYMENT_METHODS.map(value => ({
    value,
    label: t(`esim.methods.${value}`),
    hint: t(`esim.methodHints.${value}`),
    sandbox: available.value.find(entry => entry.method === value)?.sandbox ?? false,
  })))

  const emailError = computed(() => (touched.value && !EMAIL.test(email.value.trim()) ? t('esim.errors.email') : ''))
  const phoneError = computed(() => (touched.value && !isCompletePhone(phone.value) ? t('esim.errors.phone') : ''))

  const ready = computed(() => Boolean(plan.value) && EMAIL.test(email.value.trim()) && isCompletePhone(phone.value))

  async function pay() {
    touched.value = true

    if (!ready.value || !plan.value || busy.value) return

    busy.value = true

    try {
      const purchase = await checkout({
        planId: plan.value.id,
        email: email.value,
        phone: toE164(phone.value),
        method: method.value,
        locale: locale.value,
      })

      if (purchase.pay_url) window.location.assign(purchase.pay_url)
    }
    catch (e) {
      failed(e)
      busy.value = false
    }
  }

  return {
    code, name, flag, networks, cards, plan, selected, status, error,
    email, phone, method, methodOptions, emailError, phoneError, busy, pay,
  }
}
