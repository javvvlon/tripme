<template>
    <div class="tm-post-feed">
        <div class="tm-post-feed__grid">
            <NuxtLink
                v-for="post in shown" :key="post.uuid"
                :to="localePath(post.href ?? '/blog')"
                class="tm-post-feed__card"
            >
                <span class="tm-post-feed__media">
                    <Photo :photo="{ src: post.imageUrl ?? null, alt: post.title }" ratio="fill" sizes="(max-width: 900px) 100vw, 360px" />
                </span>

                <span class="tm-post-feed__body">
                    <h3 class="tm-post-feed__title">{{ post.title }}</h3>
                    <p v-if="post.description" class="tm-post-feed__excerpt">{{ post.description }}</p>
                    <span class="tm-post-feed__by">{{ postByline(post, locale) }}</span>
                </span>
            </NuxtLink>
        </div>

        <div v-if="shown.length < items.length" class="tm-post-feed__more">
            <Button variant="secondary" size="md" @click="limit += pageSize">
                {{ t('post.index.more', { count: items.length - shown.length }) }}
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { postByline } from '~/shared/helpers/byline'
import type { IPostFeedProps } from './PostFeed.d'

const props = defineProps<IPostFeedProps>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const limit = ref(props.pageSize)

watch(() => props.pageSize, (next) => { limit.value = next })

const shown = computed(() => props.items.slice(0, limit.value))
</script>

<style lang="scss">
@use './_post-feed.scss';
</style>
