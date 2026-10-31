<template>
    <component
        :is="link ? NuxtLink : 'figure'"
        v-if="bare && imageUrl"
        v-bind="link ? { to: link.trim() } : {}"
        class="tm-promo-picture"
    >
        <img :src="imageUrl" alt="" :class="{ 'tm-only-light': imageUrlDark }" :loading="eager ? 'eager' : 'lazy'" decoding="async">
        <img v-if="imageUrlDark" :src="imageUrlDark" alt="" class="tm-only-dark" loading="lazy" decoding="async">
    </component>

    <article
        v-else
        class="tm-promo"
        :class="[`is-${look}`, `is-${tone}`, { 'has-image': imageUrl }]"
    >
        <img
            v-if="imageUrl" :src="imageUrl" alt=""
            class="tm-promo__image" :class="{ 'tm-only-light': imageUrlDark }"
            :loading="eager ? 'eager' : 'lazy'" decoding="async"
        >
        <img
            v-if="imageUrl && imageUrlDark" :src="imageUrlDark" alt=""
            class="tm-promo__image tm-only-dark"
            loading="lazy" decoding="async"
        >

        <div class="tm-promo__text">
            <span v-if="eyebrow" class="tm-promo__eyebrow">{{ eyebrow }}</span>
            <h2 v-if="title" class="tm-promo__title">{{ title }}</h2>
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
import { NuxtLink } from '#components'
import { linkProps } from '~/shared/helpers/link'
import type { IPromoBannerProps } from './PromoBanner.d'

const props = withDefaults(defineProps<IPromoBannerProps>(), { look: 'card', tone: 'light' })

const bare = computed(() => !props.title?.trim() && !props.eyebrow?.trim() && !props.text?.trim() && !props.ctaLabel?.trim())
</script>

<style lang="scss">
@use './_promo-banner.scss';
</style>
