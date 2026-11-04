import { useAuthRepository } from '~/modules/auth/repositories/auth.repository'
import { useAuthorize } from '~/modules/auth/hooks/use-authorize'
import { useAuthForm } from './Auth.form'
import { ACCOUNT_DEACTIVATED } from './Auth.config'

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

  let attempt = 0

  async function submit() {
    if (pending.value) return

    error.value = ''

    if (!form.validate()) return

    const current = ++attempt

    pending.value = true

    try {
      await authorize(await login({ ...form.values }))
    }
    catch (e) {
      if (current !== attempt) return

      const response = e as { status?: number, data?: { code?: string } }

      if (response.data?.code === ACCOUNT_DEACTIVATED) error.value = t('auth.errors.deactivated')
      else if (response.status === 401 || response.status === 400) error.value = t('auth.errors.invalidCredentials')
      else error.value = t('auth.errors.failed')
    }
    finally {
      if (current === attempt) pending.value = false
    }
  }

  return { form, pending, error, submit }
}
