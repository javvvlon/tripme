<template>
    <span class="tm-rating" :aria-label="label">
        <span class="tm-rating__stars" aria-hidden="true">
            <Icon
                v-for="i in max" :key="i"
                name="star" filled :size="size"
                :class="{ 'tm-rating__star--off': i > Math.round(value) }"
            />
        </span>
        <span v-if="reviews" class="tm-rating__reviews" aria-hidden="true">
            {{ t('common.reviews', reviews) }}
        </span>
    </span>
</template>

<script setup lang="ts">
import type { IRatingProps } from './Rating.d'

const props = withDefaults(defineProps<IRatingProps>(), { max: 5, size: 13 })

const { t } = useI18n()

const label = computed(() =>
  props.reviews
    ? t('common.ratingWithReviews', { value: props.value, max: props.max, reviews: props.reviews })
    : t('common.rating', { value: props.value, max: props.max }),
)
</script>

<style lang="scss">
@use './_rating.scss';
</style>
