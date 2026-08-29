import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_STATUSES } from '~/modules/leads/contracts/leads'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLead = () => {
  const { t } = useI18n()
  const route = useRoute()
  const localePath = useLocalePath()

  const { one, patch, remove: removeLead } = useLeadsRepository()

  const id = computed(() => String(route.params.id ?? ''))

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const supplierOrderId = ref('')
  const passportId = ref('')
  const passportExpiresAt = ref('')

  const { data: lead, status, refresh } = useAsyncData<ILeadRaw | null>(
    'cms:lead',
    async () => {
      try {
        const found = await one(id.value)

        supplierOrderId.value = found.supplier_order_id
        passportId.value = found.passport_id
        passportExpiresAt.value = found.passport_expires_at ?? ''

        return found
      }
      catch {
        error.value = t('cms.errors.load')

        return null
      }
    },
    { default: () => null },
  )

  const statusOptions = computed(() =>
    LEAD_STATUSES.map(value => ({ value, label: t(`cms.leads.status.${value}`) })))

  async function change(next: LeadStatus) {
    await save({ status: next })
  }

  async function saveDetails() {
    await save({
      supplier_order_id: supplierOrderId.value,
      passport_id: passportId.value,
      passport_expires_at: passportExpiresAt.value || null,
    })
  }

  async function save(body: Partial<{ status: LeadStatus, supplier_order_id: string, passport_id: string, passport_expires_at: string | null }>) {
    error.value = ''
    saved.value = false
    saving.value = true

    try {
      lead.value = await patch(id.value, body)
      saved.value = true
    }
    catch {
      error.value = t('cms.errors.save')
    }
    finally {
      saving.value = false
    }
  }

  async function remove() {
    error.value = ''

    try {
      await removeLead(id.value)
      await navigateTo(localePath('/app/leads'))
    }
    catch {
      error.value = t('cms.errors.save')
    }
  }

  return {
    lead, status, error, saving, saved,
    supplierOrderId, passportId, passportExpiresAt,
    statusOptions, change, saveDetails, remove, refresh,
  }
}
