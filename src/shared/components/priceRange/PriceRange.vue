<template>
    <div class="tm-price-range">
        <div class="tm-price-range__histogram" aria-hidden="true">
            <span
                v-for="(bucket, i) in buckets" :key="i"
                class="tm-price-range__bar"
                :class="{ 'is-active': isActive(bucket), 'is-tall': height(bucket) > 60 }"
                :style="{ height: `${height(bucket)}%` }"
            />
        </div>

        <div class="tm-price-range__inputs">
            <div class="tm-price-range__field">
                <label :for="`${id}-from`">{{ fromLabel }}</label>
                <input :id="`${id}-from`" v-model.number="from" type="number" :min="min" :max="max">
            </div>
            <div class="tm-price-range__field">
                <label :for="`${id}-to`">{{ toLabel }}</label>
                <input :id="`${id}-to`" v-model.number="to" type="number" :min="min" :max="max">
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import type { IPriceBucket, IPriceRangeProps } from './PriceRange.d'

const props = defineProps<IPriceRangeProps>()

const id = useId()

const from = defineModel<number | undefined>('from')
const to = defineModel<number | undefined>('to')

const tallest = computed(() => Math.max(1, ...props.buckets.map(b => b.count)))

function height(bucket: IPriceBucket): number {
  return Math.max(6, Math.round((bucket.count / tallest.value) * 100))
}

function isActive(bucket: IPriceBucket): boolean {
  return bucket.to >= (from.value ?? props.min) && bucket.from <= (to.value ?? props.max)
}
</script>

<style lang="scss">
@use './_price-range.scss';
</style>
