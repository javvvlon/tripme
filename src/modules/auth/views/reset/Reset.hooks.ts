import { useAuthRepository } from '~/modules/auth/repositories'
import { useAuthorize } from '~/modules/auth/hooks/use-authorize'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useReset = () => {
  const { t, locale } = useI18n()
  const { failed } = useToast()
  const { forgotPassword, resetPassword } = useAuthRepository()
  const authorize = useAuthorize()

  const step = ref<'email' | 'code'>('email')
  const email = ref('')
  const code = ref('')
  const password = ref('')
  const pending = ref(false)
  const error = ref('')

  const emailValid = computed(() => EMAIL.test(email.value.trim()))
  const codeValid = computed(() => /^\d{6}$/.test(code.value.trim()) && password.value.length >= 8)

  async function send() {
    if (!emailValid.value || pending.value) return

    pending.value = true
    error.value = ''

    try {
      await forgotPassword(email.value, locale.value)
      step.value = 'code'
    }
    catch (e) {
      error.value = failed(e)
    }
    finally {
      pending.value = false
    }
  }

  async function reset() {
    if (!codeValid.value || pending.value) return

    pending.value = true
    error.value = ''

    try {
      await authorize(await resetPassword(email.value, code.value, password.value))
    }
    catch (e) {
      error.value = failed(e, t('auth.reset.failed'))
    }
    finally {
      pending.value = false
    }
  }

  return { step, email, code, password, pending, error, emailValid, codeValid, send, reset }
}
