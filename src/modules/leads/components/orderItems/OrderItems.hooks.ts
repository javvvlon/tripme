import { formatDateRange, formatMoney } from '~/shared/utils/format'
import { TRACKED_ITEM_KINDS } from '~/modules/leads/contracts/leads'
import { ITEM_ICONS } from './OrderItems.config'
import type { Money } from '~/search_engine/contracts/search'
import type { IOrderItemBody, IOrderItemRaw } from '~/modules/leads/contracts/leads'
import type { IOrderItemsProps } from './OrderItems.d'

type Emit = {
  (event: 'rate', itemId: string, rate: number): void
  (event: 'confirm', itemId: string, supplierRef: string): void
  (event: 'save', itemId: string | null, body: IOrderItemBody): void
  (event: 'remove', itemId: string): void
  (event: 'issue', itemId: string, file: File | null): void
}

const LOCKED_STATUSES = ['issued', 'cancelled', 'rejected']
const INACTIVE_STATUSES = ['cancelled', 'rejected']

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOrderItems = (props: IOrderItemsProps, emit: Emit) => {
  const { t, locale } = useI18n()
  const { ask } = useConfirm()

  const editing = ref('')
  const rateDraft = ref('')
  const confirming = ref('')
  const refDraft = ref('')
  const serviceOpen = ref(false)
  const serviceItem = ref<IOrderItemRaw | null>(null)
  const issuing = ref('')
  const issueFile = ref<File | null>(null)

  const titleOf = (id: string) => {
    const item = props.items.find(entry => entry.uuid === id)

    return item ? item.title || t(`cms.orders.items.kinds.${item.kind}`) : ''
  }

  const confirmingTitle = computed(() => titleOf(confirming.value))
  const editingTitle = computed(() => titleOf(editing.value))
  const issuingTitle = computed(() => titleOf(issuing.value))

  const parsedRate = computed(() => Number(rateDraft.value.replace(/\s/g, '').replace(',', '.')))
  const rateValid = computed(() => Number.isFinite(parsedRate.value) && parsedRate.value > 0)

  function startConfirm(item: IOrderItemRaw) {
    refDraft.value = item.supplier_ref
    confirming.value = item.uuid
  }

  function saveConfirm() {
    if (!refDraft.value.trim()) return

    emit('confirm', confirming.value, refDraft.value.trim())
    confirming.value = ''
  }

  function startRate(item: IOrderItemRaw) {
    rateDraft.value = item.fx_rate ? String(item.fx_rate) : ''
    editing.value = item.uuid
  }

  function saveRate() {
    if (!rateValid.value) return

    emit('rate', editing.value, parsedRate.value)
    editing.value = ''
  }

  function addService() {
    serviceItem.value = null
    serviceOpen.value = true
  }

  function editService(item: IOrderItemRaw) {
    serviceItem.value = item
    serviceOpen.value = true
  }

  const saveService = (body: IOrderItemBody) => emit('save', serviceItem.value?.uuid ?? null, body)

  function startIssue(item: IOrderItemRaw) {
    issueFile.value = null
    issuing.value = item.uuid
  }

  function pickIssueFile(event: Event) {
    issueFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
  }

  const saveIssue = () => emit('issue', issuing.value, issueFile.value)

  async function removeService(item: IOrderItemRaw) {
    const confirmed = TRACKED_ITEM_KINDS.includes(item.kind) && (item.status === 'confirmed' || item.status === 'issued')
    const name = item.title || t(`cms.orders.items.kinds.${item.kind}`)

    if (!await ask({
      title: confirmed ? t('cms.orders.items.cancelTitle') : t('cms.orders.items.deleteTitle'),
      description: confirmed ? t('cms.orders.items.cancelText', { name }) : t('cms.orders.items.deleteText', { name }),
      confirmLabel: confirmed ? t('cms.orders.items.cancelConfirm') : t('cms.orders.items.deleteConfirm'),
      tone: 'danger',
    })) return

    emit('remove', item.uuid)
  }

  function done() {
    serviceOpen.value = false
    issuing.value = ''
  }

  const number = (value: number, digits = 2) =>
    new Intl.NumberFormat(locale.value, { maximumFractionDigits: digits }).format(value)

  const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
  const count = (value: unknown): number => (Number.isFinite(Number(value)) ? Number(value) : 0)

  const rows = computed(() => props.items.map((item) => {
    const details = item.details ?? {}
    const nights = count(details.nights)
    const adults = count(details.adults)
    const children = count(details.children)
    const manual = item.kind !== 'package'
    const tracked = TRACKED_ITEM_KINDS.includes(item.kind)
    const inactive = INACTIVE_STATUSES.includes(item.status)
    const awaiting = item.status === 'draft' || item.status === 'requested'

    const party = [
      adults ? t('search.adults', { n: adults }, adults) : '',
      children ? t('search.kids', { n: children }, children) : '',
    ].filter(Boolean).join(', ')

    const span = item.service_start && item.service_end
      ? Math.round((Date.parse(item.service_end) - Date.parse(item.service_start)) / 864e5)
      : nights

    const dates = item.service_start
      ? span > 0
        ? formatDateRange(item.service_start, span, locale.value)
        : formatDateRange(item.service_start, 0, locale.value).split(' — ')[0]
      : ''

    return {
      ...item,
      icon: ITEM_ICONS[item.kind] ?? 'tag',
      manual,
      tracked,
      inactive,
      meta: [item.supplier_name, text(details.meal_name), text(details.room_name)].filter(Boolean).join(' · '),
      when: [dates, party].filter(Boolean).join(' · '),
      note: text(details.note),
      price: item.price_amount
        ? formatMoney({ amount: item.price_amount, currency: (item.price_currency || 'USD') as Money['currency'] }, locale.value)
        : '',
      foreign: Boolean(item.price_currency) && item.price_currency !== 'UZS',
      confirmButton: tracked && awaiting,
      canEdit: manual && !props.locked && !LOCKED_STATUSES.includes(item.status),
      canIssue: manual && tracked && !props.locked && !LOCKED_STATUSES.includes(item.status),
      canRemove: manual && !props.locked && !inactive,
      uzs: item.price_uzs ? t('cms.orders.items.uzs', { amount: `${number(item.price_uzs, 0)} ${t('cms.finance.sum')}` }) : '',
      rateText: item.fx_rate
        ? t('cms.orders.items.rate', { rate: number(item.fx_rate), date: (item.fx_date ?? '').split('-').reverse().slice(0, 2).join('.') })
        : t('cms.orders.items.rateMissing'),
    }
  }))

  const activeCount = computed(() => props.items.filter(item => !INACTIVE_STATUSES.includes(item.status)).length)

  return {
    rows, activeCount, editing, rateDraft, confirming, refDraft, rateValid, confirmingTitle, editingTitle,
    serviceOpen, serviceItem, issuing, issueFile, issuingTitle,
    startConfirm, saveConfirm, startRate, saveRate, addService, editService, saveService,
    startIssue, pickIssueFile, saveIssue, removeService, done,
  }
}
