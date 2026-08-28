<template>
    <article class="tm-post">
        <div v-if="status === 'pending'" class="tm-post__inner">
            <Skeleton height="34px" width="70%" />
            <Skeleton height="320px" />
            <Skeleton height="17px" :lines="6" />
        </div>

        <div v-else-if="!post" class="tm-post__inner tm-post__missing">
            <h1 class="tm-post__title">{{ t('post.missing.title') }}</h1>
            <p class="tm-post__lead">{{ t('post.missing.lead') }}</p>
            <Button :to="localePath('/')">{{ t('post.missing.home') }}</Button>
        </div>

        <template v-else>
            <header class="tm-post__head">
                <div class="tm-post__inner">
                    <Badge v-if="post.badge" :tone="post.badge.type">{{ post.badge.label }}</Badge>

                    <h1 class="tm-post__title">{{ post.title }}</h1>

                    <p v-if="post.excerpt" class="tm-post__lead">{{ post.excerpt }}</p>

                    <time v-if="published" class="tm-post__date" :datetime="post.publishedAt!">
                        {{ published }}
                    </time>
                </div>
            </header>

            <div v-if="post.imageUrl" class="tm-post__cover">
                <div class="tm-post__inner">
                    <img :src="post.imageUrl" :alt="post.title" loading="eager">
                </div>
            </div>

            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="tm-post__inner tm-post__body" v-html="body" />

            <div v-if="post.link" class="tm-post__inner tm-post__cta">
                <Button :href="post.link" variant="secondary" icon-right="arrow-right">
                    {{ t('post.readMore') }}
                </Button>
            </div>
        </template>
    </article>
</template>

<script setup lang="ts">
import { usePostPage } from './Post.hooks'
import { renderMarkdown } from '~/shared/helpers/markdown'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const url = useRequestURL()

const { post, status } = usePostPage()

const body = computed(() => renderMarkdown(post.value?.body))

const published = computed(() => {
    const value = post.value?.publishedAt

    if (!value) return ''

    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date(value))
})

useSeoMeta({
    title: () => post.value?.title ?? t('post.missing.title'),
    description: () => post.value?.excerpt ?? '',
    ogTitle: () => post.value?.title ?? '',
    ogDescription: () => post.value?.excerpt ?? '',
    ogImage: () => post.value?.imageUrl ?? '/og-image.jpg',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: () => (post.value ? 'index, follow' : 'noindex, follow'),
})

useHead(() => ({
    link: post.value
        ? [{ rel: 'canonical', href: `${url.origin}${localePath(`/blog/${post.value.slug}`)}` }]
        : [],
}))
</script>

<style lang="scss">
@use './_post.scss';
</style>
