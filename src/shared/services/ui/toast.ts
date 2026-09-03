import type { Ref } from 'vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ToastTone = 'success' | 'error' | 'info'

export interface IToast {
  id: number
  tone: ToastTone
  message: string
  /** Milliseconds on screen. `0` keeps it until dismissed. */
  timeout: number
}

export interface IToastOptions {
  timeout?: number
}

const DEFAULT_TIMEOUT: Record<ToastTone, number> = {
  success: 3200,
  info: 4200,
  error: 6500,
}

/** At most this many on screen; the oldest gives way. */
const MAX_VISIBLE = 4

/**
 * The toast stack for one request.
 *
 * Built per request rather than at module scope: on the server a module-level
 * store is shared by everyone being rendered at once, so one visitor's error
 * could surface in another's page.
 */
export class ToastService {
  private readonly items: Ref<IToast[]>

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>()

  private next = 0

  constructor(items: Ref<IToast[]>) {
    this.items = items
  }

  get all(): Ref<IToast[]> {
    return this.items
  }

  success(message: string, options: IToastOptions = {}): number {
    return this.push('success', message, options)
  }

  error(message: string, options: IToastOptions = {}): number {
    return this.push('error', message, options)
  }

  info(message: string, options: IToastOptions = {}): number {
    return this.push('info', message, options)
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id)

    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }

    this.items.value = this.items.value.filter(item => item.id !== id)
  }

  clear(): void {
    for (const timer of this.timers.values()) clearTimeout(timer)

    this.timers.clear()
    this.items.value = []
  }

  private push(tone: ToastTone, message: string, options: IToastOptions): number {
    const text = message.trim()

    if (!text) return -1

    /**
     * The same message twice in a row is almost always one action reported
     * twice, not two things going wrong. It refreshes rather than stacks.
     */
    const existing = this.items.value.find(item => item.message === text && item.tone === tone)

    if (existing) {
      this.arm(existing)

      return existing.id
    }

    const toast: IToast = {
      id: (this.next += 1),
      tone,
      message: text,
      timeout: options.timeout ?? DEFAULT_TIMEOUT[tone],
    }

    const kept = [...this.items.value, toast]

    this.items.value = kept.slice(-MAX_VISIBLE)

    for (const dropped of kept.slice(0, Math.max(0, kept.length - MAX_VISIBLE))) {
      this.dismiss(dropped.id)
    }

    this.arm(toast)

    return toast.id
  }

  private arm(toast: IToast): void {
    if (!import.meta.client || !toast.timeout) return

    const running = this.timers.get(toast.id)

    if (running) clearTimeout(running)

    this.timers.set(toast.id, setTimeout(() => this.dismiss(toast.id), toast.timeout))
  }
}
