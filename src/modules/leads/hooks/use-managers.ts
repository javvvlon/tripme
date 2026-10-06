import { useLeadsRepository } from '~/modules/leads/repositories'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { IStaffMember, ManagerFilter } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useManagers = (scope: 'leads' | 'orders' = 'leads') => {
  const { t } = useI18n()
  const { user } = useAuthSession()
  const { staff } = useLeadsRepository()

  const elevated = computed(() => user.value?.canSeeAllClients() ?? false)
  const me = computed(() => user.value?.get('id') ?? '')

  const { data: people } = useAsyncData('cms:staff', () => staff(), { default: () => [] as IStaffMember[] })

  const filterOptions = computed(() => [
    { value: 'all', label: t(elevated.value ? 'cms.ownership.filter.all' : 'cms.ownership.filter.allMine') },
    { value: 'me', label: t('cms.ownership.filter.mine') },
    { value: 'none', label: t(elevated.value ? 'cms.ownership.filter.none' : 'cms.ownership.filter.queue') },
    ...(elevated.value
      ? (people.value ?? [])
          .filter(person => person.uuid !== me.value)
          .map(person => ({ value: person.uuid, label: person.name }))
      : []),
  ])

  const assignOptions = computed(() => (people.value ?? []).map(person => ({
    value: person.uuid,
    label: person.uuid === me.value ? `${person.name} · ${t('cms.ownership.you')}` : person.name,
    hint: t(`cms.ownership.roles.${person.role}`),
  })))

  const managerFilter = useState<ManagerFilter>(`cms:manager-filter:${scope}`, () => 'all')

  return { elevated, me, people, filterOptions, assignOptions, managerFilter }
}
