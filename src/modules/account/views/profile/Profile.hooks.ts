import { useAccountRepository } from '~/modules/account/repositories'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { MIN_PASSWORD_LENGTH } from '~/modules/auth/views/auth/Auth.config'
import { isCompletePhone, phoneDigits } from '~/shared/helpers/phone'
import type { IPasswordDraft, IProfileDraft } from '~/modules/account/contracts/account'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useProfile = () => {
  const { t } = useI18n()
  const { failed, saved } = useToast()
  const { user } = useAuthSession()
  const { updateProfile, changePassword } = useAccountRepository()

  const details = reactive<IProfileDraft>({
    firstName: user.value?.get('firstName') ?? '',
    lastName: user.value?.get('lastName') ?? '',
    phone: phoneDigits(user.value?.get('phoneNumber') ?? ''),
  })

  const detailsForm = useValidation(details, {
    firstName: [required()],
    lastName: [required()],
    phone: [required(), custom<string, IProfileDraft>(value => isCompletePhone(value), 'validation.phone')],
  })

  const savingDetails = ref(false)

  async function saveDetails() {
    if (!detailsForm.validate()) return

    savingDetails.value = true

    try {
      user.value = await updateProfile(details)
      saved(t('account.profile.saved'))
    }
    catch (e) {
      failed(e, t('account.profile.saveFailed'))
    }
    finally {
      savingDetails.value = false
    }
  }

  const password = reactive<IPasswordDraft>({ current: '', next: '', confirm: '' })

  const passwordForm = useValidation(password, {
    current: [required()],
    next: [required(), minLength(MIN_PASSWORD_LENGTH)],
    confirm: [required(), sameAs<IPasswordDraft>('next')],
  })

  const savingPassword = ref(false)

  async function savePassword() {
    if (!passwordForm.validate()) return

    savingPassword.value = true

    try {
      await changePassword(password)

      password.current = ''
      password.next = ''
      password.confirm = ''
      passwordForm.reset()

      saved(t('account.profile.passwordChanged'))
    }
    catch (e) {
      failed(e, t('account.profile.passwordFailed'))
    }
    finally {
      savingPassword.value = false
    }
  }

  return {
    user,
    details, detailsForm, savingDetails, saveDetails,
    password, passwordForm, savingPassword, savePassword,
  }
}
