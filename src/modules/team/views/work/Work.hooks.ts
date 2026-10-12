import { useTeamRepository } from '~/modules/team/repositories'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import type { IMyWork } from '~/modules/team/contracts/team'
import { WORK_REFRESH_MS } from './Work.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useWork = () => {
  const { t, locale } = useI18n()
  const { user } = useAuthSession()
  const { myWork } = useTeamRepository()

  const { data: work, status, refresh } = useAsyncData<IMyWork | null>('cms:my-work', () => myWork(), { default: () => null })

  const greeting = computed(() => {
    const hour = new Date().getHours()
    const part = hour < 5 ? 'evening' : hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening'

    return t(`cms.work.greeting.${part}`, { name: user.value?.get('firstName') ?? '' })
  })

  const today = computed(() => new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()))

  const total = computed(() => Object.values(work.value ?? {}).reduce((sum, value) => sum + value, 0))

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => { timer = setInterval(() => { if (!document.hidden) void refresh() }, WORK_REFRESH_MS) })
  onBeforeUnmount(() => { if (timer) clearInterval(timer) })

  return { work, status, greeting, today, total }
}
