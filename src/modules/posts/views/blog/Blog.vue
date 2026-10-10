<template>
    <div class="tm-blog">
        <div v-if="status === 'pending'" class="container tm-blog__loading">
            <Skeleton height="120px" />
            <Skeleton height="300px" />
        </div>

        <p v-else-if="!sections.length" class="container tm-blog__empty">{{ t('post.index.empty') }}</p>

        <ContentSection
            v-for="(section, i) in sections" v-else :key="section.uuid"
            :section="section" :eager="i < 2"
        />
    </div>
</template>

<script setup lang="ts">
import Skeleton from '~/shared/components/skeleton/Skeleton.vue'
import { useBlog } from './Blog.hooks'

const { t } = useI18n()
const localePath = useLocalePath()
const url = useRequestURL()

const { sections, seo, status } = await useBlog()

const title = computed(() => seo.value?.title || t('post.index.seoTitle'))
const description = computed(() => seo.value?.description || t('post.index.lead'))

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: url.origin + localePath('/blog') }],
}))
</script>

<style lang="scss">
@use './_blog.scss';
</style>
