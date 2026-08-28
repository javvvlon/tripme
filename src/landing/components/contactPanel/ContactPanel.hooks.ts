import { MESSAGE_MAX, PHONE_PREFIX } from './ContactPanel.config'

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
    phone: [required(), minLength(7)],
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
        phone: `${PHONE_PREFIX}${form.phone.replace(/\D/g, '')}`,
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
