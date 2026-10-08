<template>
    <article
        class="tm-promo"
        :class="[`is-${look}`, `is-${tone}`, { 'has-image': imageUrl }]"
    >
        <img
            v-if="imageUrl" :src="imageUrl" alt=""
            class="tm-promo__image"
            :loading="eager ? 'eager' : 'lazy'" decoding="async"
        >

        <div class="tm-promo__text">
            <span v-if="eyebrow" class="tm-promo__eyebrow">{{ eyebrow }}</span>
            <h2 class="tm-promo__title">{{ title }}</h2>
            <p v-if="text" class="tm-promo__lead">{{ text }}</p>
            <Button
                v-if="ctaLabel && link"
                v-bind="linkProps(link)"
                :variant="tone === 'light' ? 'primary' : 'secondary'"
                size="lg" icon-right="arrow-right"
                class="tm-promo__cta"
            >
                {{ ctaLabel }}
            </Button>
        </div>
    </article>
</template>

<script setup lang="ts">
import { linkProps } from '~/shared/helpers/link'
import type { IPromoBannerProps } from './PromoBanner.d'

withDefaults(defineProps<IPromoBannerProps>(), { look: 'card', tone: 'light' })
</script>

<style lang="scss">
@use './_promo-banner.scss';
</style>
