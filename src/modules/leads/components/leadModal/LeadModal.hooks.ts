import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { isCompletePhone, phoneDigits } from '~/shared/helpers/phone'
import type { ILeadDraft, ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useLeadForm = (trip: () => ILeadTrip) => {
  const { t, locale } = useI18n()
  const { submit: send } = useLeadsRepository()
  const { user } = useAuthSession()

  const draft = reactive<ILeadDraft>({ firstName: '', lastName: '', phone: '', comment: '', consent: false })

  const sending = ref(false)
  const sent = ref(false)
  const error = ref('')

  const validation = useValidation(() => draft, {
    firstName: [required()],
    lastName: [required()],
    phone: [required(), custom(value => isCompletePhone(String(value ?? '')), 'validation.phone')],
    consent: [custom(value => value === true, 'validation.consent')],
  })

  function reset() {
    draft.firstName = user.value?.get('firstName') ?? ''
    draft.lastName = user.value?.get('lastName') ?? ''
    draft.phone = phoneDigits(user.value?.get('phoneNumber') ?? '')
    draft.comment = ''
    draft.consent = false

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
