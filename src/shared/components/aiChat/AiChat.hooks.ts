import type { IAiCapability, IAiChatProps, IAiMessage, IAiPicture, IAiTurn } from './AiChat.d'
import type { IAiInputExpose } from '../aiInput/AiInput.d'
import { readFailure } from '~/shared/services/ui/failure'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const TYPE_STEP_MS = 16

const TYPE_CHARS = 3

const THINK_STEP_MS = 2600

const PREVIEW_HEIGHT = 280

const COPIED_MS = 1600

export const useAiChat = (props: IAiChatProps) => {
  const { t } = useI18n()

  const input = ref<IAiInputExpose | null>(null)
  const thread = ref<HTMLElement | null>(null)
  const text = ref('')
  const image = shallowRef<File | null>(null)
  const busy = ref(false)
  const step = ref(0)
  const messages = ref<IAiMessage[]>([])
  const context = ref<Record<string, unknown>>({})

  let ids = 0
  let typing: ReturnType<typeof setInterval> | null = null
  let thinking: ReturnType<typeof setInterval> | null = null
  const urls: string[] = []

  const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scroll = () => nextTick(() => {
    const element = thread.value

    if (element) element.scrollTo({ top: element.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' })
  })

  function typeOut(message: IAiMessage) {
    if (typing) clearInterval(typing)

    if (reduced()) {
      message.shown = message.text.length
      return
    }

    typing = setInterval(() => {
      message.shown = Math.min(message.text.length, message.shown + TYPE_CHARS)
      scroll()

      if (message.shown >= message.text.length && typing) {
        clearInterval(typing)
        typing = null
      }
    }, TYPE_STEP_MS)
  }

  const history = (): IAiTurn[] => messages.value
    .filter(message => message.tone !== 'error' && message.text)
    .map(message => ({ role: message.role, text: message.text }))

  async function ask(value = text.value) {
    const said = value.trim()
    const file = image.value

    if (busy.value || (!said && !file)) return

    const preview = file ? URL.createObjectURL(file) : undefined

    if (preview) urls.push(preview)

    const past = history()

    messages.value.push({ id: ++ids, role: 'user', text: said, image: preview, shown: said.length })
    text.value = ''
    image.value = null
    busy.value = true
    step.value = 0
    thinking = setInterval(() => { step.value = Math.min(step.value + 1, props.thinking.length - 1) }, THINK_STEP_MS)
    scroll()

    try {
      const answer = await props.send({ text: said, image: file, history: past, context: context.value })

      if (answer.context) context.value = { ...context.value, ...answer.context }

      messages.value.push({ ...answer, id: ++ids, role: 'assistant', shown: 0 })

      const last = messages.value[messages.value.length - 1]

      if (last) typeOut(last)
    }
    catch (failure) {
      messages.value.push({ id: ++ids, role: 'assistant', tone: 'error', text: readFailure(failure, (key, params) => t(key, params ?? {})), shown: Infinity })
    }
    finally {
      busy.value = false

      if (thinking) clearInterval(thinking)

      scroll()
      nextTick(() => input.value?.focus())
    }
  }

  function use(capability: IAiCapability) {
    if (capability.attach) {
      input.value?.attach()
      return
    }

    text.value = capability.prompt ?? ''
    nextTick(() => input.value?.focus())
  }

  function reset() {
    if (typing) clearInterval(typing)

    messages.value = []
    context.value = {}
    text.value = ''
    image.value = null
    nextTick(() => input.value?.focus())
  }

  const visible = (message: IAiMessage) => message.text.slice(0, message.shown)

  const done = (message: IAiMessage) => message.shown >= message.text.length

  onBeforeUnmount(() => {
    if (typing) clearInterval(typing)
    if (thinking) clearInterval(thinking)

    for (const url of urls) URL.revokeObjectURL(url)
  })

  const copied = ref('')

  const frame = (picture: IAiPicture) => ({ width: `min(100%, ${Math.round(PREVIEW_HEIGHT * picture.width / picture.height)}px)` })

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      copied.value = url
      setTimeout(() => { if (copied.value === url) copied.value = '' }, COPIED_MS)
    }
    catch {
      window.open(url, '_blank', 'noopener')
    }
  }

  return { input, thread, text, image, busy, step, messages, ask, use, reset, visible, done, copied, frame, copyLink }
}
