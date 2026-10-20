import { useMarketingRepository } from '~/modules/marketing/repositories'
import type { IBotStatus } from '~/modules/marketing/contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTelegramBot = () => {
  const { failed } = useToast()
  const repository = useMarketingRepository()

  const bot = ref<IBotStatus | null>(null)
  const busy = ref(false)
  const url = ref('')

  const load = () => repository.bot().then((status) => { bot.value = status }).catch(() => { bot.value = null })

  async function connect() {
    busy.value = true

    try {
      const link = await repository.botLink()

      url.value = link.url
      window.open(link.url, '_blank', 'noopener')
    }
    catch (failure) {
      failed(failure)
    }
    finally {
      busy.value = false
    }
  }

  async function disconnect() {
    busy.value = true

    try {
      bot.value = await repository.botUnlink()
      url.value = ''
    }
    catch (failure) {
      failed(failure)
    }
    finally {
      busy.value = false
    }
  }

  const refresh = () => {
    if (url.value && !bot.value?.linked) void load()
  }

  onMounted(() => {
    void load()
    window.addEventListener('focus', refresh)
  })

  onBeforeUnmount(() => window.removeEventListener('focus', refresh))

  return { bot, busy, url, connect, disconnect }
}
