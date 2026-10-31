import type { Ref } from 'vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const HERO_SEARCH_IN_VIEW = 'hero:search-in-view'

export const HERO_UNDER_HEADER = 'hero:under-header'

const HEADER_OFFSET_PX = 80

export const useSearchDock = (target: Ref<{ $el?: Element } | Element | null>) => {
  const docked = ref(false)
  const inView = useState<boolean>(HERO_SEARCH_IN_VIEW, () => true)

  let observer: IntersectionObserver | null = null
  let header: IntersectionObserver | null = null

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

    header = new IntersectionObserver(([entry]) => {
      inView.value = !!entry?.isIntersecting
    }, { rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px` })

    header.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    header?.disconnect()
    inView.value = false
  })

  const back = (): void => {
    element()?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return { docked, back }
}

export const useHeroUnderHeader = (target: Ref<Element | null>) => {
  const under = useState<boolean>(HERO_UNDER_HEADER, () => true)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return

    observer = new IntersectionObserver(([entry]) => {
      under.value = !!entry?.isIntersecting
    }, { rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px` })

    observer.observe(target.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    under.value = false
  })
}
