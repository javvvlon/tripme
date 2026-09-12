import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { isCompletePhone, phoneDigits } from '~/shared/helpers/phone'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTourRequest = (trip: () => ILeadTrip) => {
  const { t, locale } = useI18n()
  const { user, isClient } = useAuthSession()
  const { submit } = useLeadsRepository()
  const toast = useToast()

  const asking = ref(false)
  const sending = ref(false)
  const sent = ref(false)

  const direct = computed(() =>
    isClient.value && isCompletePhone(user.value?.get('phoneNumber') ?? ''))

  async function request() {
    if (sent.value) return

    if (!direct.value) {
      asking.value = true

      return
    }

    sending.value = true

    try {
      await submit({
        firstName: user.value?.get('firstName') ?? '',
        lastName: user.value?.get('lastName') ?? '',
        phone: phoneDigits(user.value?.get('phoneNumber') ?? ''),
        comment: '',
      }, trip(), locale.value)

      sent.value = true
      toast.success(t('lead.sentToAccount'))
    }
    catch {
      toast.error(t('lead.error'))
    }
    finally {
      sending.value = false
    }
  }

  return { asking, sending, sent, request }
}
