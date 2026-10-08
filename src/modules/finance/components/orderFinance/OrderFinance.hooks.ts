import { useFinanceRepository } from '~/modules/finance/repositories'
import { CUSTOMER_DIRECTIONS, PAYMENT_CURRENCIES, PAYMENT_DIRECTIONS, PAYMENT_METHODS } from '~/modules/finance/contracts/finance'
import { today } from '~/shared/helpers/dates'
import type { IFinanceRaw, IPaymentDraft, IPaymentRaw } from '~/modules/finance/contracts/finance'
import type { IOrderFinanceProps } from './OrderFinance.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOrderFinance = (props: IOrderFinanceProps, changed: (finance: IFinanceRaw) => void) => {
  const { t, locale } = useI18n()
  const { failed, saved } = useToast()
  const { ask } = useConfirm()
  const { rates } = useUzsRates()
  const { overview, record, reverse, setDeposit } = useFinanceRepository()

  const finance = ref<IFinanceRaw | null>(null)
  const loading = ref(true)
  const busy = ref(false)
  const paying = ref(false)
  const editingDeposit = ref(false)
  const depositDraft = ref('')

  const blank = (): IPaymentDraft => ({
    direction: 'customer_in',
    amount: null,
    currency: 'UZS',
    fxRate: '',
    method: 'cash',
    paidAt: today(),
    note: '',
    receipt: null,
  })

  const draft = reactive<IPaymentDraft>(blank())

  const sum = (value: number): string =>
    `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)} ${t('cms.finance.sum')}`

  const plain = (value: number, digits = 2): string =>
    new Intl.NumberFormat(locale.value, { maximumFractionDigits: digits }).format(value)

  async function load() {
    loading.value = true

    try {
      finance.value = await overview(props.orderId)
    }
    catch (e) {
      failed(e)
    }
    finally {
      loading.value = false
    }
  }

  const adopt = (next: IFinanceRaw) => {
    finance.value = next
    changed(next)
  }

  watch(() => [props.orderId, props.version], load, { immediate: true })

  watch(() => draft.currency, (currency) => {
    const rate = currency === 'UZS' ? null : rates.value?.rates?.[currency]

    draft.fxRate = rate ? String(Math.round(rate * 100) / 100) : ''
  })

  const directions = computed(() => PAYMENT_DIRECTIONS
    .filter(direction => finance.value?.can_reverse || CUSTOMER_DIRECTIONS.includes(direction))
    .map(value => ({ value, label: t(`cms.finance.directions.${value}`) })))

  const methods = computed(() => PAYMENT_METHODS.map(value => ({ value, label: t(`cms.finance.methods.${value}`) })))

  const currencies = PAYMENT_CURRENCIES.map(value => ({ value, label: value }))

  const needsReceipt = computed(() => CUSTOMER_DIRECTIONS.includes(draft.direction))

  const draftUzs = computed(() => {
    const amount = draft.amount ?? Number.NaN
    const rate = draft.currency === 'UZS' ? 1 : Number(draft.fxRate.replace(/\s/g, '').replace(',', '.'))

    return Number.isFinite(amount) && amount > 0 && Number.isFinite(rate) && rate > 0 ? Math.round(amount * rate) : null
  })

  const canSave = computed(() =>
    draftUzs.value !== null && (!needsReceipt.value || Boolean(draft.receipt)) && !busy.value)

  const depositProgress = computed(() => {
    const value = finance.value

    if (!value || !value.deposit_uzs) return 0

    return Math.min(100, Math.round(Math.max(0, value.received_uzs) / value.deposit_uzs * 100))
  })

  const rows = computed(() => (finance.value?.payments ?? []).map((payment: IPaymentRaw) => ({
    ...payment,
    title: payment.reverses ? t('cms.finance.reversal') : t(`cms.finance.directions.${payment.direction}`),
    meta: [
      payment.paid_at.split('-').reverse().join('.'),
      t(`cms.finance.methods.${payment.method}`),
      payment.recorded_by ? t('cms.finance.byWhom', { name: payment.recorded_by }) : '',
    ].filter(Boolean).join(' · '),
    main: payment.currency === 'UZS' ? sum(payment.amount_uzs) : `${plain(payment.amount)} ${payment.currency}`,
    sub: payment.currency === 'UZS' ? '' : t('cms.finance.paymentUzs', { amount: sum(payment.amount_uzs), rate: plain(payment.fx_rate) }),
    outgoing: payment.direction === 'supplier_out' || payment.direction === 'customer_refund',
    canReverse: Boolean(finance.value?.can_reverse) && !payment.reverses && !payment.reversed,
  })))

  function openForm() {
    Object.assign(draft, blank())
    paying.value = true
  }

  function pickReceipt(event: Event) {
    draft.receipt = (event.target as HTMLInputElement).files?.[0] ?? null
  }

  async function submit() {
    if (!canSave.value) return

    busy.value = true

    try {
      adopt(await record(props.orderId, draft))
      paying.value = false
      saved(t('cms.finance.saved'))
    }
    catch (e) {
      failed(e)
    }
    finally {
      busy.value = false
    }
  }

  async function undo(payment: IPaymentRaw) {
    if (!await ask({
      title: t('cms.finance.reverseTitle'),
      description: t('cms.finance.reverseText', { amount: sum(payment.amount_uzs) }),
      confirmLabel: t('cms.finance.reverseConfirm'),
      tone: 'danger',
    })) return

    busy.value = true

    try {
      adopt(await reverse(payment.uuid))
      saved(t('cms.finance.reverseDone'))
    }
    catch (e) {
      failed(e)
    }
    finally {
      busy.value = false
    }
  }

  function editDeposit() {
    depositDraft.value = String(finance.value?.deposit_percent ?? '')
    editingDeposit.value = true
  }

  async function saveDeposit() {
    const value = Number(depositDraft.value)

    if (!Number.isInteger(value) || value < 0 || value > 100) return

    busy.value = true

    try {
      adopt(await setDeposit(props.orderId, value))
      editingDeposit.value = false
    }
    catch (e) {
      failed(e)
    }
    finally {
      busy.value = false
    }
  }

  return {
    finance, loading, busy, paying, draft, rows, directions, methods, currencies,
    needsReceipt, draftUzs, canSave, depositProgress, editingDeposit, depositDraft,
    sum, openForm, pickReceipt, submit, undo, editDeposit, saveDeposit, reload: load,
  }
}
