import type { Ref } from 'vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useSearchDock = (target: Ref<{ $el?: Element } | Element | null>) => {
  const docked = ref(false)

  let observer: IntersectionObserver | null = null

  const element = (): Element | null => {
    const value = target.value

    if (!value) return null

    return value instanceof Element ? value : value.$el ?? null
  }

  onMounted(() => {
    const el = element()

    if (!el) return

    observer = new IntersectionObserver(([entry]) => {
      docked.value = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0
    })

    observer.observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())

  const back = (): void => {
    element()?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return { docked, back }
}
