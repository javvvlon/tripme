import { useMessagesRepository } from '~/modules/messages/repositories'
import type { StreamEvent } from '~/modules/messages/contracts/messages'

type Listener = (event: StreamEvent) => void

const listeners = new Set<Listener>()

const RETRY_MS = [2000, 5000, 10000, 30000]

let source: EventSource | null = null
let connecting = false
let attempt = 0
let retry: ReturnType<typeof setTimeout> | null = null

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMessageStream = () => {
  const { streamTicket } = useMessagesRepository()
  const base = String(useRuntimeConfig().public.apiBase).replace(/\/+$/, '')

  const close = () => {
    if (retry) clearTimeout(retry)
    retry = null
    source?.close()
    source = null
  }

  const schedule = () => {
    if (!listeners.size || retry) return

    const delay = RETRY_MS[Math.min(attempt, RETRY_MS.length - 1)]!

    attempt += 1
    retry = setTimeout(() => {
      retry = null
      void open()
    }, delay)
  }

  async function open() {
    if (!import.meta.client || source || connecting || !listeners.size) return

    connecting = true

    try {
      const ticket = await streamTicket()
      const next = new EventSource(`${base}/messages/stream?ticket=${encodeURIComponent(ticket)}`)

      next.onmessage = (message) => {
        attempt = 0

        try {
          const event = JSON.parse(message.data) as StreamEvent | { type: 'ping' | 'ready' }

          if (event.type === 'message' || event.type === 'read') {
            for (const listener of listeners) listener(event)
          }
        }
        catch {
          return
        }
      }

      next.onerror = () => {
        next.close()
        if (source === next) source = null
        schedule()
      }

      source = next
    }
    catch {
      schedule()
    }
    finally {
      connecting = false
    }
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener)
    void open()

    return () => {
      listeners.delete(listener)
      if (!listeners.size) close()
    }
  }

  const onEvent = (listener: Listener) => {
    let off: (() => void) | null = null

    onMounted(() => { off = subscribe(listener) })
    onBeforeUnmount(() => off?.())
  }

  return { onEvent }
}
