import { MESSAGE_MAX } from './ContactPanel.config'
import { isCompletePhone, toE164 } from '~/shared/helpers/phone'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useContactForm = () => {
  const { t } = useI18n()
  const http = useHttp()

  const form = reactive({ firstName: '', lastName: '', phone: '', message: '' })

  const sending = ref(false)
  const sent = ref(false)
  const error = ref('')

  const validation = useValidation(() => form, {
    firstName: [required()],
    phone: [required(), custom(value => isCompletePhone(String(value ?? '')), 'validation.phone')],
    message: [maxLength(MESSAGE_MAX)],
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
      })

      sent.value = true
      form.firstName = ''
      form.lastName = ''
      form.phone = ''
      form.message = ''
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
