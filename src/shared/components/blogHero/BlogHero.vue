<template>
    <header class="tm-blog-hero" :class="{ 'has-image': imageUrl }">
        <img v-if="imageUrl" :src="imageUrl" alt="" class="tm-blog-hero__image" :class="{ 'tm-only-light': imageUrlDark }" loading="eager" decoding="async">
        <img v-if="imageUrl && imageUrlDark" :src="imageUrlDark" alt="" class="tm-blog-hero__image tm-only-dark" loading="lazy" decoding="async">

        <div class="tm-blog-hero__text">
            <h1 v-if="title" class="tm-blog-hero__title">{{ title }}</h1>
            <p v-if="subtitle" class="tm-blog-hero__lead">{{ subtitle }}</p>
        </div>
    </header>
</template>

<script setup lang="ts">
import type { IBlogHeroProps } from './BlogHero.d'

defineProps<IBlogHeroProps>()
</script>

<style lang="scss">
@use './_blog-hero.scss';
</style>
