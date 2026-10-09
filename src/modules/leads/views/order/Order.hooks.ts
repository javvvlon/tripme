import type { FieldInput, FieldValue } from '~/shared/helpers/numbers'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { ORDER_TRANSITIONS } from '~/modules/leads/contracts/leads'
import type { IOrderDocument, IOrderEvent, IOrderRaw, OrderStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IOrderDraft {
  travellerName: string
  passportId: string
  passportExpiresAt: string
  country: string
  hotelName: string
  supplierName: string
  supplierOrderId: string
  dealDate: string
  checkIn: string
  returnDate: string
  nights: FieldInput
  adults: FieldInput
  children: FieldInput
  priceAmount: FieldValue
  priceCurrency: string
  branch: string
  note: string
}

const blank = (): IOrderDraft => ({
  travellerName: '', passportId: '', passportExpiresAt: '',
  country: '', hotelName: '', supplierName: '', supplierOrderId: '',
  dealDate: '', checkIn: '', returnDate: '',
  nights: '', adults: '', children: '',
  priceAmount: '', priceCurrency: '', branch: '', note: '',
})

export const useOrder = () => {
  const { t } = useI18n()
  const { failed, saved: cheer, fail, loadFailed } = useToast()
  const { ask } = useConfirm()
  const route = useRoute()
  const localePath = useLocalePath()

  const {
    order: fetchOrder, orderHistory, patchOrder, archiveOrder, restoreOrder,
    orderDocuments, generateDocument, attachDocument, removeDocument,
  } = useLeadsRepository()

  const id = computed(() => String(route.params.id ?? ''))

  const draft = reactive<IOrderDraft>(blank())
  const history = ref<IOrderEvent[]>([])

  const documents = ref<IOrderDocument[]>([])
  const documentsLoading = ref(false)
  const working = ref<'offer' | 'invoice' | 'attachment' | null>(null)

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const adopt = (found: IOrderRaw) => {
    draft.travellerName = found.traveller_name
    draft.passportId = found.passport_id
    draft.passportExpiresAt = found.passport_expires_at ?? ''
    draft.country = found.country
    draft.hotelName = found.hotel_name
    draft.supplierName = found.supplier_name
    draft.supplierOrderId = found.supplier_order_id
    draft.dealDate = found.deal_date ?? ''
    draft.checkIn = found.check_in ?? ''
    draft.returnDate = found.return_date ?? ''
    draft.nights = String(found.nights || '')
    draft.adults = String(found.adults || '')
    draft.children = String(found.children || '')
    draft.priceAmount = found.price_amount === null ? '' : String(found.price_amount)
    draft.priceCurrency = found.price_currency
    draft.branch = found.branch
    draft.note = found.note
  }

  const { data: order, status, refresh } = useAsyncData<IOrderRaw | null>(
    'cms:order',
    async () => {
      try {
        const found = await fetchOrder(id.value)

        adopt(found)
        history.value = await orderHistory(id.value)

        void loadDocuments()

        return found
      }
      catch {
        error.value = loadFailed(t('cms.errors.load'))

        return null
      }
    },
    { default: () => null },
  )

  const statusOptions = computed(() => {
    const current = order.value?.status

    if (!current) return []

    return [current, ...ORDER_TRANSITIONS[current]].map(value => ({
      value,
      label: t(`cms.orders.status.${value}`),
    }))
  })

  async function save(body: Parameters<typeof patchOrder>[1]) {
    error.value = ''
    saved.value = false
    saving.value = true

    try {
      const next = await patchOrder(id.value, body)

      order.value = next
      adopt(next)
      history.value = await orderHistory(id.value)
      saved.value = true
      cheer()
    }
    catch (e) {
      error.value = failed(e)
    }
    finally {
      saving.value = false
    }
  }

  const assignManager = (value: string | null) => {
    const target = value || null

    if (!order.value || target === order.value.manager_id) return

    void save({ manager_id: target })
  }

  const cancelling = ref(false)
  const cancelReason = ref('')

  const change = (next: OrderStatus) => {
    if (next === 'cancelled') {
      cancelReason.value = ''
      cancelling.value = true

      return
    }

    return save({ status: next })
  }

  async function confirmCancel() {
    if (!cancelReason.value.trim()) return

    await save({ status: 'cancelled', cancel_reason: cancelReason.value.trim() })

    if (order.value?.status === 'cancelled') cancelling.value = false
  }

  const submit = () => save({
    traveller_name: draft.travellerName,
    passport_id: draft.passportId,
    passport_expires_at: draft.passportExpiresAt || null,
    country: draft.country,
    hotel_name: draft.hotelName,
    supplier_name: draft.supplierName,
    supplier_order_id: draft.supplierOrderId,
    deal_date: draft.dealDate || null,
    check_in: draft.checkIn || null,
    return_date: draft.returnDate || null,
    nights: asCount(draft.nights),
    adults: asCount(draft.adults),
    children: asCount(draft.children),
    price_amount: asAmount(draft.priceAmount),
    price_currency: draft.priceCurrency,
    branch: draft.branch,
    note: draft.note,
  })

  async function archive() {
    if (!await ask({
      title: t('cms.archive.orderTitle'),
      description: t('cms.archive.orderText'),
      subject: order.value ? `${order.value.ref} · ${order.value.hotel_name || ''}`.trim() : undefined,
      confirmLabel: t('cms.archive.confirm'),
    })) return

    await setArchived(true)
  }

  const restore = () => setArchived(false)

  async function setArchived(archived: boolean) {
    error.value = ''

    try {
      const next = archived ? await archiveOrder(id.value) : await restoreOrder(id.value)

      if (order.value) {
        order.value.archived_at = next.archived_at ?? null
        triggerRef(order)
      }

      cheer(archived ? t('cms.archive.orderDone') : t('cms.archive.restored'))
    }
    catch (e) {
      error.value = failed(e)
    }
  }

  async function loadDocuments() {
    if (!id.value) return

    documentsLoading.value = true

    try {
      documents.value = await orderDocuments(id.value)
    }
    catch (e) {
      failed(e, t('cms.orders.documents.loadFailed'))
    }
    finally {
      documentsLoading.value = false
    }
  }

  async function generate(kind: 'offer' | 'invoice') {
    if (working.value) return

    working.value = kind

    try {
      const made = await generateDocument(id.value, kind)

      documents.value = [made, ...documents.value]

      cheer(t(`cms.orders.documents.${kind}Made`))

      if (kind === 'offer') await refresh()
    }
    catch (e) {
      failed(e, t('cms.orders.documents.generateFailed'))
    }
    finally {
      working.value = null
    }
  }

  async function attach(file: File | null | undefined) {
    if (!file || working.value) return

    working.value = 'attachment'

    try {
      documents.value = [await attachDocument(id.value, file), ...documents.value]

      cheer(t('cms.orders.documents.attached'))
    }
    catch (e) {
      failed(e, t('cms.orders.documents.attachFailed'))
    }
    finally {
      working.value = null
    }
  }

  async function dropDocument(document: IOrderDocument) {
    if (!await ask({
      title: t('cms.orders.documents.confirmDelete.title'),
      description: t('cms.orders.documents.confirmDelete.lead'),
      subject: document.name,
    })) return

    try {
      await removeDocument(document.id)

      documents.value = documents.value.filter(item => item.id !== document.id)
    }
    catch (e) {
      failed(e, t('cms.orders.documents.removeFailed'))
    }
  }

  return {
    order, draft, status, error, saving, saved, history,
    statusOptions, change, submit, archive, restore, refresh, assignManager,
    documents, documentsLoading, working, loadDocuments, generate, attach, dropDocument,
    cancelling, cancelReason, confirmCancel,
  }
}
