import type { IStageCarouselProps } from './StageCarousel.d'
import { SWIPE_PX } from './StageCarousel.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useStageCarousel = (props: IStageCarouselProps, root: Ref<HTMLElement | null>) => {
  const index = ref(0)
  const hovered = ref(false)
  const focused = ref(false)
  const visible = ref(false)
  const calm = ref(false)
  const dragX = ref(0)

  const count = computed(() => props.items.length)
  const paused = computed(() => hovered.value || focused.value || !visible.value || calm.value)

  const go = (next: number) => {
    if (!count.value) return

    index.value = (next + count.value) % count.value
  }

  const next = () => go(index.value + 1)
  const prev = () => go(index.value - 1)

  const offsetOf = (position: number): number => {
    const n = count.value
    let offset = position - index.value

    if (offset > n / 2) offset -= n
    if (offset < -n / 2) offset += n

    return offset
  }

  let startX: number | null = null
  let dragged = false

  function onDown(event: PointerEvent) {
    dragged = false

    if (count.value < 2 || event.button !== 0) return

    startX = event.clientX
  }

  function onMove(event: PointerEvent) {
    if (startX === null) return

    dragX.value = event.clientX - startX
  }

  function onUp() {
    if (startX === null) return

    if (dragX.value <= -SWIPE_PX) next()
    else if (dragX.value >= SWIPE_PX) prev()

    dragged = Math.abs(dragX.value) > 6
    startX = null
    dragX.value = 0
  }

  const moved = () => dragged

  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') next()
    else if (event.key === 'ArrowLeft') prev()
    else return

    event.preventDefault()
  }

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    calm.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    observer = new IntersectionObserver(([entry]) => { visible.value = Boolean(entry?.isIntersecting) }, { threshold: 0.4 })

    if (root.value) observer.observe(root.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  watch(count, () => { if (index.value >= count.value) index.value = 0 })

  return {
    index, count, paused, hovered, focused, dragX,
    go, next, prev, offsetOf, onDown, onMove, onUp, onKey, moved,
  }
}
