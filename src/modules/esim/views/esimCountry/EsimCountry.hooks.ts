import { useEsimRepository } from '~/modules/esim/repositories'
import { countryName, flagOf, sumOf, usdOf } from '~/modules/esim/helpers/esim'
import { ESIM_PAYMENT_METHODS } from '~/modules/esim/contracts/esim'
import { isCompletePhone, toE164 } from '~/shared/helpers/phone'
import { useTourRequest } from '~/modules/leads/hooks/use-tour-request'
import { esimTitle, esimTrip } from '~/modules/esim/helpers/trip'
import type { EsimPaymentMethod, IEsimMode, IEsimPlan } from '~/modules/esim/contracts/esim'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimCountry = () => {
  const { t, locale } = useI18n()
  const route = useRoute()
  const { failed } = useToast()
  const { plans, mode, methods, checkout } = useEsimRepository()

  const code = computed(() => String(route.params.country ?? '').toUpperCase())

  const { data, status, error } = useAsyncData(
    () => `esim:plans:${code.value}`,
    () => plans(code.value),
    { default: () => [] as IEsimPlan[] },
  )

  const { data: setup } = useAsyncData('esim:mode', () => mode(), { default: (): IEsimMode => ({ mode: 'checkout', provider: null }) })

  const catalog = computed(() => setup.value.mode === 'catalog')

  const affiliate = computed(() => (setup.value.mode === 'affiliate' ? setup.value.affiliate ?? null : null))

  const copied = ref(false)

  async function copyCode() {
    if (!affiliate.value) return

    try {
      await navigator.clipboard.writeText(affiliate.value.code)
      copied.value = true
      setTimeout(() => { copied.value = false }, 2400)
    }
    catch {
      copied.value = false
    }
  }

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

  const usd = (value: number) => usdOf(value, locale.value)

  const cards = computed(() => data.value.map(plan => ({
    ...plan,
    volume: volume(plan),
    period: t('esim.days', { n: plan.days }, plan.days),
    price: affiliate.value ? usd(plan.price_usd) : sum(plan.price_uzs),
    perDay: t('esim.perDay', {
      price: affiliate.value ? usd(Math.round(plan.price_usd / plan.days * 100) / 100) : sum(Math.round(plan.price_uzs / plan.days / 100) * 100),
    }),
    approx: t('esim.affiliate.approx', { price: sum(plan.price_uzs) }),
  })))

  const plan = computed(() => cards.value.find(entry => entry.id === selected.value) ?? null)

  const title = computed(() => (plan.value ? esimTitle(name.value, plan.value.volume, plan.value.period) : ''))

  const trip = computed<ILeadTrip>(() => (plan.value
    ? esimTrip({ code: code.value, name: name.value, provider: setup.value.provider, plan: plan.value, volume: plan.value.volume, period: plan.value.period })
    : { hotel_name: '', supplier_name: '', check_in: null, nights: 0, adults: 1, children: 0, price_amount: null, price_currency: 'UZS', route_from: '', route_to: '' }))

  const summary = computed(() => (plan.value ? `${flag.value} ${title.value} · ${plan.value.price}` : ''))

  const { asking, sending: requesting, sent: requested, request } = useTourRequest(() => trip.value)

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
    catalog, affiliate, copied, copyCode, trip, summary, asking, requesting, requested, request,
    email, phone, method, methodOptions, emailError, phoneError, busy, pay,
  }
}
