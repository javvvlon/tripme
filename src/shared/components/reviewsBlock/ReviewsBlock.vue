<template>
    <div v-if="items.length" class="tm-reviews">
        <div class="tm-reviews__summary">
            <template v-if="average !== null">
                <strong class="tm-reviews__score">{{ score }}</strong>
                <span class="tm-reviews__rating">
                    <span class="tm-reviews__stars" :style="{ '--fill': `${(average / 5) * 100}%` }" role="img" :aria-label="t('reviews.average', { score })">
                        <span class="tm-reviews__stars-base">
                            <Icon v-for="star in STARS" :key="star" name="star" filled :size="18" />
                        </span>
                        <span class="tm-reviews__stars-fill">
                            <Icon v-for="star in STARS" :key="star" name="star" filled :size="18" />
                        </span>
                    </span>
                    <span class="tm-reviews__count">{{ t('reviews.count', { n: rated.length }, rated.length) }}</span>
                </span>
            </template>

            <p v-if="lead" class="tm-reviews__lead">{{ lead }}</p>

            <div v-if="!(atStart && atEnd)" class="tm-reviews__arrows">
                <button type="button" class="tm-reviews__arrow" :disabled="atStart" :aria-label="t('reviews.prev')" @click="step(-1)">
                    <Icon name="chevron-left" :size="18" />
                </button>
                <button type="button" class="tm-reviews__arrow" :disabled="atEnd" :aria-label="t('reviews.next')" @click="step(1)">
                    <Icon name="chevron-right" :size="18" />
                </button>
            </div>
        </div>

        <ul ref="track" class="tm-reviews__track" :class="{ 'is-more': !atEnd }" @scroll.passive="measure">
            <li v-for="item in items" :key="item.uuid" class="tm-reviews__card">
                <div class="tm-reviews__top">
                    <span v-if="item.rating" class="tm-reviews__card-stars" role="img" :aria-label="t('reviews.stars', { n: item.rating })">
                        <Icon v-for="star in STARS" :key="star" name="star" filled :size="15" :class="{ 'is-on': star <= item.rating }" />
                    </span>
                    <Icon name="quote" :size="28" :stroke="1.4" class="tm-reviews__mark" />
                </div>

                <blockquote v-if="item.description" class="tm-reviews__text">{{ markdownToText(item.description) }}</blockquote>

                <div class="tm-reviews__by">
                    <span class="tm-reviews__avatar">
                        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" loading="lazy" decoding="async">
                        <template v-else>{{ initialsOf(item.title) }}</template>
                    </span>
                    <span class="tm-reviews__who">
                        <strong>{{ item.title }}</strong>
                        <span v-if="item.subtitle">{{ item.subtitle }}</span>
                    </span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { markdownToText } from '~/shared/helpers/markdown'
import { initialsOf } from '~/shared/helpers/initials'
import { STARS, useReviews } from './ReviewsBlock.hooks'
import type { IReviewsBlockProps } from './ReviewsBlock.d'

const props = defineProps<IReviewsBlockProps>()

const { t } = useI18n()

const track = ref<HTMLElement | null>(null)

const { rated, average, score, atStart, atEnd, measure, step } = useReviews(toRef(props, 'items'), track)
</script>

<style lang="scss">
@use './_reviews-block.scss';
</style>
