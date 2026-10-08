import { useLeadsRepository } from '~/modules/leads/repositories'
import type { ILeadRaw, ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAssignTour = (lead: Readonly<Ref<ILeadRaw | null>>) => {
  const { t } = useI18n()
  const { saved, failed } = useToast()
  const localePath = useLocalePath()
  const { patch } = useLeadsRepository()

  const busy = ref('')

  const label = computed(() => {
    if (!lead.value) return ''

    return lead.value.hotel_name ? t('results.assign.replace') : t('results.assign.cta')
  })

  const title = computed(() => (lead.value ? t('results.assign.title', { ref: lead.value.ref }) : ''))

  async function assign(trip: ILeadTrip) {
    const target = lead.value

    if (!target || busy.value) return

    busy.value = String(trip.offer_id ?? 'tour')

    try {
      await patch(target.uuid, { trip })
      saved(t('cms.leads.offer.assigned'))
      await navigateTo(localePath(`/app/leads/${target.uuid}`))
    }
    catch (e) {
      failed(e)
    }
    finally {
      busy.value = ''
    }
  }

  return { busy, label, title, assign }
}
