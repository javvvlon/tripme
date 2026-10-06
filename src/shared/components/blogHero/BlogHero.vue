<template>
    <header class="tm-blog-hero" :class="{ 'has-image': imageUrl }">
        <img v-if="imageUrl" :src="imageUrl" alt="" class="tm-blog-hero__image" loading="eager" decoding="async">

        <div class="tm-blog-hero__text">
            <h1 class="tm-blog-hero__title">{{ title }}</h1>
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
