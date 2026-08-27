/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IInfiniteScrollOptions {
  enabled?: Ref<boolean>
  rootMargin?: string
}

export function useInfiniteScroll(
  load: () => void | Promise<void>,
  options: IInfiniteScrollOptions = {},
) {
  const sentinel = ref<HTMLElement | null>(null)
  const { enabled, rootMargin = '600px' } = options

  let observer: IntersectionObserver | null = null

  const disconnect = () => {
    observer?.disconnect()
    observer = null
  }

  const observe = () => {
    if (!import.meta.client || !sentinel.value) return

    disconnect()

    observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) void load()
    }, { rootMargin })

    observer.observe(sentinel.value)
  }

  onMounted(observe)
  onBeforeUnmount(disconnect)

  watch(sentinel, observe)

  if (enabled) {
    watch(enabled, (value) => {
      if (value) observe()
      else disconnect()
    })
  }

  return { sentinel }
}
