import { useLeadsRepository } from '~/modules/leads/repositories'
import { emptyManualDraft } from '~/modules/leads/contracts/leads'
import { isCompletePhone } from '~/shared/helpers/phone'
import type { ILeadManualDraft, ILeadRaw } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useManualLead = (onCreated: (lead: ILeadRaw) => void) => {
  const { t } = useI18n()
  const { create } = useLeadsRepository()

  const draft = reactive<ILeadManualDraft>(emptyManualDraft())

  const saving = ref(false)
  const error = ref('')

  const validation = useValidation(() => draft, {
    firstName: [required()],
    lastName: [required()],
    phone: [required(), custom(value => isCompletePhone(String(value ?? '')), 'validation.phone')],
  })

  function reset() {
    Object.assign(draft, emptyManualDraft())

    error.value = ''
    validation.reset()
  }

  async function submit() {
    error.value = ''

    if (!validation.validate()) return

    saving.value = true

    try {
      onCreated(await create(draft))
    }
    catch {
      error.value = t('cms.errors.save')
    }
    finally {
      saving.value = false
    }
  }

  return { draft, validation, saving, error, submit, reset }
}
