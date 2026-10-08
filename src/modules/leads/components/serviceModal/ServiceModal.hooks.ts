import { ITEM_CURRENCIES, MANUAL_ITEM_KINDS } from '~/modules/leads/contracts/leads'
import { ITEM_ICONS } from '~/modules/leads/components/orderItems/OrderItems.config'
import type { IOrderItemBody, ManualItemKind } from '~/modules/leads/contracts/leads'
import type { IServiceDraft, IServiceModalProps } from './ServiceModal.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useServiceModal = (props: IServiceModalProps, open: Ref<boolean>, save: (body: IOrderItemBody) => void) => {
  const { t } = useI18n()

  const draft = reactive<IServiceDraft>({
    kind: 'visa',
    title: '',
    supplier: '',
    start: '',
    end: '',
    amount: null,
    currency: 'USD',
    note: '',
  })

  const editing = computed(() => Boolean(props.item))

  function reset() {
    const item = props.item
    const note = item?.details?.note

    Object.assign(draft, {
      kind: (item?.kind ?? 'visa') as ManualItemKind,
      title: item?.title ?? '',
      supplier: item?.supplier_name ?? '',
      start: item ? item.service_start ?? '' : props.start ?? '',
      end: item ? item.service_end ?? '' : props.end ?? '',
      amount: item?.price_amount ?? null,
      currency: item?.price_currency || 'USD',
      note: typeof note === 'string' ? note : '',
    })
  }

  watch(open, (value) => { if (value) reset() }, { immediate: true })

  function pickKind(kind: ManualItemKind) {
    draft.kind = kind
  }

  const kinds = MANUAL_ITEM_KINDS.map(kind => ({ kind, icon: ITEM_ICONS[kind], label: t(`cms.orders.items.kinds.${kind}`) }))

  const currencies = ITEM_CURRENCIES.map(value => ({ value, label: value }))

  const amount = computed(() => draft.amount ?? Number.NaN)

  const datesWrong = computed(() => Boolean(draft.start && draft.end && draft.end < draft.start))

  const valid = computed(() =>
    Boolean(draft.title.trim()) && Number.isFinite(amount.value) && amount.value > 0 && !datesWrong.value)

  const placeholder = computed(() => t(`cms.orders.items.form.examples.${draft.kind}`))

  function submit() {
    if (!valid.value) return

    save({
      kind: draft.kind,
      title: draft.title.trim(),
      supplier_name: draft.supplier.trim(),
      service_start: draft.start || null,
      service_end: draft.end || null,
      price_amount: amount.value,
      price_currency: draft.currency,
      note: draft.note.trim(),
    })
  }

  return { draft, editing, kinds, currencies, valid, datesWrong, placeholder, pickKind, submit }
}
