import type { Ref } from 'vue'
import type { IContentItem } from '~/modules/content/models/PageContent'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const STARS = [1, 2, 3, 4, 5] as const

export const useReviews = (items: Ref<IContentItem[]>, track: Ref<HTMLElement | null>) => {
  const { locale } = useI18n()

  const rated = computed(() => items.value.filter(item => item.rating))

  const average = computed(() => {
    if (!rated.value.length) return null

    return rated.value.reduce((sum, item) => sum + item.rating!, 0) / rated.value.length
  })

  const score = computed(() => average.value === null
    ? ''
    : new Intl.NumberFormat(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.round(average.value * 10) / 10))

  const atStart = ref(true)
  const atEnd = ref(true)

  const measure = () => {
    const el = track.value

    if (!el) return

    atStart.value = el.scrollLeft <= 4
    atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
  }

  const step = (direction: -1 | 1) => {
    const el = track.value
    const card = el?.firstElementChild as HTMLElement | null

    if (!el || !card) return

    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0

    el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  let observer: ResizeObserver | null = null

  onMounted(() => {
    measure()
    observer = new ResizeObserver(measure)
    if (track.value) observer.observe(track.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  watch(() => items.value.length, () => nextTick(measure))

  return { rated, average, score, atStart, atEnd, measure, step }
}
