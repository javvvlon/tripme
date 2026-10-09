<template>
    <div class="tm-price-range">
        <div v-if="hasRange" class="tm-price-range__track">
            <div class="tm-price-range__histogram" aria-hidden="true">
                <span
                    v-for="(bucket, i) in buckets" :key="i"
                    class="tm-price-range__bar"
                    :class="{ 'is-active': isActive(bucket) }"
                    :style="{ height: `${height(bucket)}%` }"
                />
            </div>

            <div class="tm-price-range__slider">
                <span class="tm-price-range__rail" aria-hidden="true">
                    <span class="tm-price-range__fill" :style="{ left: `${positionOf(low)}%`, right: `${100 - positionOf(high)}%` }" />
                </span>
                <input
                    type="range" class="tm-price-range__thumb"
                    min="0" max="100" step="0.5" :value="positionOf(low)"
                    :aria-label="fromLabel" :aria-valuetext="grouped(low)"
                    @input="slideLow"
                >
                <input
                    type="range" class="tm-price-range__thumb"
                    min="0" max="100" step="0.5" :value="positionOf(high)"
                    :aria-label="toLabel" :aria-valuetext="grouped(high)"
                    @input="slideHigh"
                >
            </div>
        </div>

        <div class="tm-price-range__inputs">
            <label class="tm-price-range__field">
                <span>{{ fromLabel }}</span>
                <input
                    :value="from === undefined ? '' : grouped(from)" inputmode="numeric"
                    :placeholder="hasRange ? grouped(min) : ''"
                    @change="typed('from', $event)"
                >
                <small v-if="currency">{{ symbol }}</small>
            </label>
            <label class="tm-price-range__field">
                <span>{{ toLabel }}</span>
                <input
                    :value="to === undefined ? '' : grouped(to)" inputmode="numeric"
                    :placeholder="hasRange ? grouped(max) : ''"
                    @change="typed('to', $event)"
                >
                <small v-if="currency">{{ symbol }}</small>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IPriceBucket, IPriceRangeProps } from './PriceRange.d'

const props = defineProps<IPriceRangeProps>()

const from = defineModel<number | undefined>('from')
const to = defineModel<number | undefined>('to')

const { locale } = useI18n()

const SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', UZS: 'сум' }

const symbol = computed(() => SYMBOLS[props.currency ?? ''] ?? props.currency ?? '')

const hasRange = computed(() => props.max > props.min)

const edges = computed(() => {
  if (!props.buckets.length) return [props.min, props.max]

  return [props.min, ...props.buckets.slice(0, -1).map(bucket => bucket.to), props.max]
})

function priceAt(position: number): number {
  const points = edges.value
  const segments = points.length - 1
  const scaled = Math.min(Math.max(position, 0), 100) / 100 * segments
  const index = Math.min(Math.floor(scaled), segments - 1)
  const start = points[index]!
  const end = points[index + 1]!
  const value = start + (end - start) * (scaled - index)
  const round = end - start > 2000 ? 10 : 1

  return Math.round(value / round) * round
}

function positionOf(price: number): number {
  const points = edges.value
  const segments = points.length - 1

  if (!hasRange.value || segments < 1) return 0

  for (let i = 0; i < segments; i += 1) {
    const start = points[i]!
    const end = points[i + 1]!

    if (price <= end || i === segments - 1) {
      const share = end > start ? (Math.min(Math.max(price, start), end) - start) / (end - start) : 0

      return ((i + share) / segments) * 100
    }
  }

  return 100
}

const low = computed(() => Math.max(props.min, Math.min(from.value ?? props.min, props.max)))
const high = computed(() => Math.min(props.max, Math.max(to.value ?? props.max, props.min)))

const tallest = computed(() => Math.max(1, ...props.buckets.map(bucket => bucket.count)))

const height = (bucket: IPriceBucket) => (bucket.count ? Math.max(8, Math.round((bucket.count / tallest.value) * 100)) : 4)

const isActive = (bucket: IPriceBucket) => bucket.to >= low.value && bucket.from <= high.value

const grouped = (value: number) => new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)

function slideLow(event: Event) {
  const position = Number((event.target as HTMLInputElement).value)
  const value = Math.min(priceAt(position), high.value)

  from.value = position <= 0 ? undefined : value
}

function slideHigh(event: Event) {
  const position = Number((event.target as HTMLInputElement).value)
  const value = Math.max(priceAt(position), low.value)

  to.value = position >= 100 ? undefined : value
}

function typed(edge: 'from' | 'to', event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '')
  const value = digits ? Number(digits) : undefined

  if (edge === 'from') from.value = value
  else to.value = value
}
</script>

<style lang="scss">
@use './_price-range.scss';
</style>
