import type { IStageCarouselProps } from './StageCarousel.d'
import { SWIPE_PX } from './StageCarousel.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useStageCarousel = (props: IStageCarouselProps, root: Ref<HTMLElement | null>) => {
  const count = computed(() => props.items.length)
  const looped = computed(() => count.value > 1)

  const cursor = ref(looped.value ? count.value : 0)
  const jumping = ref(false)
  const hovered = ref(false)
  const focused = ref(false)
  const visible = ref(false)
  const calm = ref(false)
  const dragX = ref(0)

  const index = computed(() => (count.value ? ((cursor.value % count.value) + count.value) % count.value : 0))
  const paused = computed(() => hovered.value || focused.value || !visible.value || calm.value)

  const strip = computed(() => (looped.value
    ? [0, 1, 2].flatMap(copy => props.items.map((item, position) => ({ item, position, key: `${copy}:${item.uuid}`, at: copy * count.value + position })))
    : props.items.map((item, position) => ({ item, position, key: item.uuid, at: position }))))

  const step = (delta: number) => {
    if (!looped.value) return

    cursor.value += delta
  }

  const next = () => step(1)
  const prev = () => step(-1)

  const go = (position: number) => {
    if (!looped.value || position === index.value) return

    cursor.value += position - index.value
  }

  function settle(event: TransitionEvent) {
    if (event.target !== event.currentTarget || event.propertyName !== 'translate' || !looped.value) return

    const n = count.value

    if (cursor.value >= n && cursor.value < 2 * n) return

    jumping.value = true
    cursor.value = n + index.value

    requestAnimationFrame(() => requestAnimationFrame(() => { jumping.value = false }))
  }

  let startX: number | null = null
  let dragged = false

  function onDown(event: PointerEvent) {
    dragged = false

    if (!looped.value || event.button !== 0) return

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

  watch(count, (n) => {
    jumping.value = true
    cursor.value = n > 1 ? n : 0
    requestAnimationFrame(() => { jumping.value = false })
  })

  return {
    index, count, cursor, strip, jumping, paused, hovered, focused, dragX,
    go, next, prev, settle, onDown, onMove, onUp, onKey, moved,
  }
}
