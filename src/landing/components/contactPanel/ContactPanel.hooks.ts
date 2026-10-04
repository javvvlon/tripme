import { MESSAGE_MAX } from './ContactPanel.config'
import { isCompletePhone, phoneDigits, toE164 } from '~/shared/helpers/phone'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useContactForm = () => {
  const { t } = useI18n()
  const http = useHttp()
  const { user } = useAuthSession()

  const form = reactive({ firstName: '', lastName: '', phone: '', message: '', consent: false })

  const prefill = () => {
    form.firstName = user.value?.get('firstName') ?? ''
    form.lastName = user.value?.get('lastName') ?? ''
    form.phone = phoneDigits(user.value?.get('phoneNumber') ?? '')
  }

  watch(user, prefill, { immediate: true })

  const sending = ref(false)
  const sent = ref(false)
  const error = ref('')

  const validation = useValidation(() => form, {
    firstName: [required()],
    phone: [required(), custom(value => isCompletePhone(String(value ?? '')), 'validation.phone')],
    message: [maxLength(MESSAGE_MAX)],
    consent: [custom(value => value === true, 'validation.consent')],
  })

  async function submit() {
    error.value = ''
    sent.value = false

    if (!validation.validate()) return

    sending.value = true

    try {
      await http.call('Landing', 'contact', {}, {
        first_name: form.firstName,
        last_name: form.lastName,
        phone: toE164(form.phone),
        message: form.message,
        consent: form.consent,
      })

      sent.value = true
      prefill()
      form.message = ''
      form.consent = false
      validation.reset()
    }
    catch {
      error.value = t('contact.error')
    }
    finally {
      sending.value = false
    }
  }

  return { form, validation, sending, sent, error, submit }
}
