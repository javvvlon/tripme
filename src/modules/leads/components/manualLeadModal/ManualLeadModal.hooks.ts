import { useLeadsRepository } from '~/modules/leads/repositories'
import { emptyManualDraft } from '~/modules/leads/contracts/leads'
import { tripFromTour } from '~/modules/leads/helpers/trip'
import { isCompletePhone } from '~/shared/helpers/phone'
import type { ILeadManualDraft, ILeadRaw } from '~/modules/leads/contracts/leads'
import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useManualLead = (onCreated: (lead: ILeadRaw) => void) => {
  const { t } = useI18n()
  const { create } = useLeadsRepository()

  const draft = reactive<ILeadManualDraft>(emptyManualDraft())
  const tour = shallowRef<Tour | null>(null)

  const saving = ref(false)
  const error = ref('')

  const validation = useValidation(() => draft, {
    firstName: [required()],
    lastName: [required()],
    phone: [required(), custom(value => isCompletePhone(String(value ?? '')), 'validation.phone')],
  })

  function reset() {
    Object.assign(draft, emptyManualDraft())

    tour.value = null
    error.value = ''
    validation.reset()
  }

  async function submit() {
    error.value = ''

    if (!validation.validate()) return

    if (!tour.value) {
      error.value = t('cms.leads.picker.required')
      return
    }

    saving.value = true

    try {
      onCreated(await create(draft, tripFromTour(tour.value)))
    }
    catch {
      error.value = t('cms.errors.save')
    }
    finally {
      saving.value = false
    }
  }

  return { draft, tour, validation, saving, error, submit, reset }
}
