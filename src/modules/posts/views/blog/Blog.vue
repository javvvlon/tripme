<template>
    <div class="tm-blog">
        <div class="container tm-blog__inner">
            <header class="tm-blog__head">
                <h1 class="tm-blog__title">{{ t('post.index.title') }}</h1>
                <p class="tm-blog__lead">{{ t('post.index.lead') }}</p>
            </header>

            <div v-if="status === 'pending'" class="tm-blog__grid">
                <Skeleton v-for="n in 3" :key="n" height="280px" />
            </div>

            <p v-else-if="!posts.length" class="tm-blog__empty">{{ t('post.index.empty') }}</p>

            <template v-else>
                <NuxtLink v-if="lead" :to="localePath(`/blog/${lead.slug}`)" class="tm-blog__lead-card">
                    <span v-if="lead.imageUrl" class="tm-blog__lead-media">
                        <img :src="lead.imageUrl!" :alt="lead.title" loading="eager" decoding="async">
                    </span>

                    <span class="tm-blog__lead-body">
                        <Badge v-if="lead.badge" :tone="lead.badge!.type">{{ lead.badge!.label }}</Badge>

                        <h2 class="tm-blog__lead-title">{{ lead.title }}</h2>

                        <p v-if="lead.excerpt" class="tm-blog__excerpt">{{ lead.excerpt }}</p>

                        <span class="tm-blog__by">{{ byline(lead) }}</span>
                    </span>
                </NuxtLink>

                <div v-if="rest.length" class="tm-blog__grid">
                    <NuxtLink
                        v-for="post in rest" :key="post.uuid"
                        :to="localePath(`/blog/${post.slug}`)"
                        class="tm-blog__card"
                    >
                        <span class="tm-blog__media">
                            <img
                                v-if="post.imageUrl"
                                :src="post.imageUrl!" :alt="post.title"
                                loading="lazy" decoding="async"
                            >
                        </span>

                        <span class="tm-blog__body">
                            <h2 class="tm-blog__card-title">{{ post.title }}</h2>
                            <p v-if="post.excerpt" class="tm-blog__excerpt">{{ post.excerpt }}</p>
                            <span class="tm-blog__by">{{ byline(post) }}</span>
                        </span>
                    </NuxtLink>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import Badge from '~/shared/components/badge/Badge.vue'
import Skeleton from '~/shared/components/skeleton/Skeleton.vue'
import { formatDate } from '~/shared/helpers/format-date'
import { useBlog } from './Blog.hooks'
import type { IPostAttributes } from '~/modules/posts/models/Post'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const url = useRequestURL()

const { posts, lead, rest, status } = useBlog()

const byline = (post: IPostAttributes): string => {
    const when = formatDate(post.publishedAt, locale.value, { dateStyle: 'long' }, '')

    return [post.author, when].filter(Boolean).join(' · ')
}

useSeoMeta({
  title: () => t('post.index.seoTitle'),
  description: () => t('post.index.lead'),
  ogTitle: () => t('post.index.seoTitle'),
  ogDescription: () => t('post.index.lead'),
})

useHead(() => ({
  link: [{ rel: 'canonical', href: url.origin + localePath('/blog') }],
}))
</script>

<style lang="scss">
@use './_blog.scss';
</style>
