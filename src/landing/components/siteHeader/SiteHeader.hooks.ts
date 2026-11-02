import type { Ref } from 'vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const HEADER_HEIGHT_VAR = '--tm-site-header-h'

export const useHeaderHeight = (target: Readonly<Ref<HTMLElement | null>>) => {
  let observer: ResizeObserver | null = null

  const publish = () => {
    if (target.value) document.documentElement.style.setProperty(HEADER_HEIGHT_VAR, `${target.value.offsetHeight}px`)
  }

  onMounted(() => {
    publish()

    if (typeof ResizeObserver === 'undefined' || !target.value) return

    observer = new ResizeObserver(publish)
    observer.observe(target.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    document.documentElement.style.removeProperty(HEADER_HEIGHT_VAR)
  })
}
