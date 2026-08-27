import { useAuthRepository } from '~/modules/auth/repositories/auth.repository'
import { useAuthorize } from '~/modules/auth/hooks/use-authorize'
import { useAuthForm } from './Auth.form'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAuth = () => {
  const { t } = useI18n()
  const { login } = useAuthRepository()
  const authorize = useAuthorize()
  const form = useAuthForm()

  const pending = ref(false)
  const error = ref('')

  async function submit() {
    error.value = ''

    if (!form.validate()) return

    pending.value = true

    try {
      await authorize(await login({ ...form.values }))
    }
    catch (e) {
      const response = e as { status?: number }

      error.value = response.status === 401 || response.status === 400
        ? t('auth.errors.invalidCredentials')
        : t('auth.errors.failed')
    }
    finally {
      pending.value = false
    }
  }

  return { form, pending, error, submit }
}
