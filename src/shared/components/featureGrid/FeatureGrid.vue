<template>
    <ul class="tm-features">
        <li v-for="item in items" :key="item.uuid" class="tm-features__item">
            <img
                v-if="item.imageUrl"
                class="tm-features__art"
                :src="item.imageUrl" alt=""
                width="128" height="120"
                loading="lazy" decoding="async"
            >

            <h3 class="tm-features__title">{{ item.title }}</h3>
            <p v-if="item.description" class="tm-features__text">{{ item.description }}</p>
        </li>
    </ul>
</template>

<script setup lang="ts">
import type { IContentItem } from '~/modules/content/models/PageContent'

defineProps<{ items: IContentItem[] }>()
</script>

<style lang="scss">
@use './_feature-grid.scss';
</style>
