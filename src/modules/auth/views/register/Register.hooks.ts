import { useAuthRepository } from '~/modules/auth/repositories/auth.repository'
import { useAuthorize } from '~/modules/auth/hooks/use-authorize'
import { toE164 } from '~/shared/helpers/phone'
import { useRegisterForm } from './Register.form'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useRegister = () => {
  const { t } = useI18n()
  const { signup } = useAuthRepository()
  const authorize = useAuthorize()
  const form = useRegisterForm()

  const pending = ref(false)
  const error = ref('')

  async function submit() {
    error.value = ''

    if (!form.validate()) return

    pending.value = true

    try {
      const tokens = await signup({
        firstName: form.values.firstName.trim(),
        lastName: form.values.lastName.trim(),
        email: form.values.email.trim(),
        phoneNumber: toE164(form.values.phone),
        password: form.values.password,
        consent: form.values.consent,
      })

      await authorize(tokens)
    }
    catch (e) {
      const response = e as { status?: number }

      error.value = response.status === 409
        ? t('auth.errors.taken')
        : t('auth.errors.registerFailed')
    }
    finally {
      pending.value = false
    }
  }

  return { form, pending, error, submit }
}
