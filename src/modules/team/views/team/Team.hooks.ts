import { useTeamRepository } from '~/modules/team/repositories'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { isCompletePhone } from '~/shared/helpers/phone'
import type { IMemberDraft, ITeamMember, TeamRole } from '~/modules/team/contracts/team'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTeam = () => {
  const { t, locale } = useI18n()
  const { failed, saved } = useToast()
  const { user } = useAuthSession()
  const repository = useTeamRepository()

  const allowed = computed(() => user.value?.get('role') === 'ADMIN')
  const me = computed(() => user.value?.get('id') ?? '')

  const { data: members, status, refresh } = useAsyncData<ITeamMember[]>(
    'cms:team',
    () => (allowed.value ? repository.members() : Promise.resolve([])),
    { default: () => [] },
  )

  const tab = ref<'active' | 'archived'>('active')

  const active = computed(() => members.value.filter(member => !member.archived_at))
  const archived = computed(() => members.value.filter(member => member.archived_at))
  const shown = computed(() => (tab.value === 'active' ? active.value : archived.value))

  const tabs = computed(() => [
    { value: 'active', label: t('cms.team.tabs.active'), count: active.value.length },
    { value: 'archived', label: t('cms.team.tabs.archived'), count: archived.value.length },
  ])

  const roles = computed<TeamRole[]>(() => ['AGENT', 'MANAGER', 'ADMIN'])

  const canManage = (member: ITeamMember) => member.uuid !== me.value && roles.value.includes(member.role)

  const nameOf = (member: ITeamMember) => [member.first_name, member.last_name].filter(Boolean).join(' ') || member.email

  const initials = (member: ITeamMember) => nameOf(member).split(/\s+/).map(part => part[0] ?? '').join('').slice(0, 2).toUpperCase()

  const lastSeen = (member: ITeamMember): string => {
    if (!member.last_seen_at) return t('cms.team.neverSeen')

    const minutes = Math.round((Date.parse(member.last_seen_at) - Date.now()) / 60000)
    const format = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })

    if (Math.abs(minutes) < 60) return format.format(minutes, 'minute')
    if (Math.abs(minutes) < 60 * 24) return format.format(Math.round(minutes / 60), 'hour')

    return format.format(Math.round(minutes / 60 / 24), 'day')
  }

  const blank = (): IMemberDraft => ({ email: '', firstName: '', lastName: '', phone: '', role: 'AGENT' })

  const creating = ref(false)
  const createBusy = ref(false)
  const createError = ref('')
  const draft = reactive<IMemberDraft>(blank())

  const openCreate = () => {
    Object.assign(draft, blank())
    createError.value = ''
    creating.value = true
  }

  const reveal = ref<{ name: string, email: string, password: string } | null>(null)
  const revealOpen = computed({
    get: () => reveal.value !== null,
    set: (open: boolean) => { if (!open) reveal.value = null },
  })

  async function create() {
    createError.value = ''

    if (!draft.email.trim() || !draft.firstName.trim()) {
      createError.value = t('cms.team.errors.required')
      return
    }

    if (draft.phone && !isCompletePhone(draft.phone)) {
      createError.value = t('validation.phone')
      return
    }

    createBusy.value = true

    try {
      const { member, password } = await repository.create(draft)

      members.value = [...members.value, member]
      creating.value = false
      reveal.value = { name: nameOf(member), email: member.email, password }
    }
    catch (e) {
      createError.value = failed(e)
    }
    finally {
      createBusy.value = false
    }
  }

  const resetting = ref<ITeamMember | null>(null)
  const resetBusy = ref(false)
  const resetError = ref('')

  const resettingOpen = computed({
    get: () => resetting.value !== null,
    set: (open: boolean) => { if (!open && !resetBusy.value) resetting.value = null },
  })

  const openReset = (member: ITeamMember) => {
    resetting.value = member
    resetError.value = ''
  }

  async function resetPassword() {
    const member = resetting.value

    if (!member) return

    resetBusy.value = true
    resetError.value = ''

    try {
      const password = await repository.resetPassword(member.uuid)

      resetBusy.value = false
      resetting.value = null
      reveal.value = { name: nameOf(member), email: member.email, password }
    }
    catch (e) {
      resetError.value = failed(e)
      resetBusy.value = false
    }
  }

  const leaving = ref<ITeamMember | null>(null)
  const handTo = ref('')
  const archiveBusy = ref(false)
  const archiveError = ref('')

  const leavingOpen = computed({
    get: () => leaving.value !== null,
    set: (open: boolean) => { if (!open && !archiveBusy.value) leaving.value = null },
  })

  const heirs = computed(() => [
    { value: '', label: t('cms.team.archive.toQueue'), hint: '' },
    ...active.value
      .filter(member => member.uuid !== leaving.value?.uuid)
      .map(member => ({ value: member.uuid, label: nameOf(member), hint: t(`cms.ownership.roles.${member.role}`) })),
  ])

  const openArchive = (member: ITeamMember) => {
    leaving.value = member
    handTo.value = ''
    archiveError.value = ''
  }

  async function archive() {
    if (!leaving.value) return

    archiveBusy.value = true
    archiveError.value = ''

    try {
      await repository.archive(leaving.value.uuid, handTo.value || null)
      saved(t('cms.team.archive.done', { name: nameOf(leaving.value) }))
      archiveBusy.value = false
      leaving.value = null
      await refresh()
    }
    catch (e) {
      archiveError.value = failed(e)
      archiveBusy.value = false
    }
  }

  async function restore(member: ITeamMember) {
    try {
      await repository.restore(member.uuid)
      saved(t('cms.team.restored', { name: nameOf(member) }))
      await refresh()
    }
    catch (e) {
      failed(e)
    }
  }

  const menuFor = (member: ITeamMember) => (member.archived_at
    ? [{ key: 'restore', label: t('cms.team.actions.restore'), icon: 'undo' }]
    : [
        { key: 'reset', label: t('cms.team.actions.reset'), icon: 'shield' },
        { key: 'archive', label: t('cms.team.actions.archive'), icon: 'folder', danger: true },
      ])

  const onMenu = (member: ITeamMember, key: string) => {
    if (key === 'reset') openReset(member)
    else if (key === 'archive') openArchive(member)
    else if (key === 'restore') void restore(member)
  }

  return {
    allowed, members, status, tab, tabs, shown, roles, me,
    canManage, nameOf, initials, lastSeen, menuFor, onMenu,
    creating, createBusy, createError, draft, openCreate, create,
    reveal, revealOpen,
    resetting, resettingOpen, resetBusy, resetError, resetPassword,
    leaving, leavingOpen, handTo, heirs, archiveBusy, archiveError, archive,
  }
}
