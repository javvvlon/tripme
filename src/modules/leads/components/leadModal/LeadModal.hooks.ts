import { useLeadsRepository } from '~/modules/leads/repositories'
import { isCompletePhone } from '~/shared/helpers/phone'
import type { ILeadDraft, ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLeadForm = (trip: () => ILeadTrip) => {
  const { t, locale } = useI18n()
  const { submit: send } = useLeadsRepository()

  const draft = reactive<ILeadDraft>({ firstName: '', lastName: '', phone: '', comment: '' })

  const sending = ref(false)
  const sent = ref(false)
  const error = ref('')

  const validation = useValidation(() => draft, {
    firstName: [required()],
    lastName: [required()],
    phone: [required(), custom(value => isCompletePhone(String(value ?? '')), 'validation.phone')],
  })

  function reset() {
    draft.firstName = ''
    draft.lastName = ''
    draft.phone = ''
    draft.comment = ''

    sent.value = false
    error.value = ''
    validation.reset()
  }

  async function submit() {
    error.value = ''

    if (!validation.validate()) return

    sending.value = true

    try {
      await send(draft, trip(), locale.value)

      sent.value = true
    }
    catch {
      error.value = t('lead.error')
    }
    finally {
      sending.value = false
    }
  }

  return { draft, validation, sending, sent, error, submit, reset }
}
