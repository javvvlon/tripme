<template>
    <NuxtLink v-if="post" :to="localePath(post.href ?? '/blog')" class="tm-featured-post">
        <span v-if="post.imageUrl" class="tm-featured-post__media">
            <img :src="post.imageUrl" :alt="post.title" loading="eager" decoding="async">
        </span>

        <span class="tm-featured-post__body">
            <Badge v-if="post.badge" :tone="post.badge.type">{{ post.badge.label }}</Badge>
            <h2 class="tm-featured-post__title">{{ post.title }}</h2>
            <p v-if="post.description" class="tm-featured-post__excerpt">{{ post.description }}</p>
            <span class="tm-featured-post__by">{{ byline(post) }}</span>
        </span>
    </NuxtLink>
</template>

<script setup lang="ts">
import Badge from '~/shared/components/badge/Badge.vue'
import { postByline } from '~/shared/helpers/byline'
import type { IContentItem } from '~/modules/content/models/PageContent'
import type { IFeaturedPostProps } from './FeaturedPost.d'

const props = defineProps<IFeaturedPostProps>()

const { locale } = useI18n()
const localePath = useLocalePath()

const post = computed(() => props.items[0] ?? null)

const byline = (item: IContentItem) => postByline(item, locale.value)
</script>

<style lang="scss">
@use './_featured-post.scss';
</style>
