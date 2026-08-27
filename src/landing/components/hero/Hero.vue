<template>
    <section class="tm-hero">
        <img
            class="tm-hero__image"
            :src="image" :alt="HERO.imageAlt"
            width="1440" height="574"
            fetchpriority="high" decoding="async"
        >
        <div class="tm-hero__scrim" aria-hidden="true" />

        <div class="container-wide tm-hero__inner">
            <h1 class="tm-hero__title">{{ title }}</h1>
            <p v-if="subtitle" class="tm-hero__subtitle">{{ subtitle }}</p>

            <SearchWidget class="tm-hero__widget" />

            <ul class="tm-hero__quick">
                <li v-for="item in QUICK_SEARCHES" :key="item.id">
                    <Chip :to="item.to" :icon="item.icon" tone="onDark">{{ t(item.labelKey) }}</Chip>
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup lang="ts">
import { HERO, QUICK_SEARCHES } from '~/landing/views/home/Home.config'
import type { IHeroProps } from './Hero.d'

const props = defineProps<IHeroProps>()

const { t } = useI18n()

/**
 * Each part falls back on its own, so an editor who wrote a headline but has
 * not uploaded a photograph gets their headline over the design's image
 * rather than nothing.
 */
const title = computed(() => props.banner?.title || t(HERO.titleKey))
const subtitle = computed(() => props.banner?.subtitle || t(HERO.subtitleKey))
const image = computed(() => props.banner?.imageUrl || HERO.image)
</script>

<style lang="scss">
@use './_hero.scss';
</style>
