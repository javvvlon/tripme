<template>
    <div v-if="lead" class="tm-spotlight" :class="{ 'is-solo': !rest.length }">
        <NuxtLink :to="localePath(lead.href ?? '/blog')" class="tm-spotlight__lead">
            <span class="tm-spotlight__media">
                <img v-if="lead.imageUrl" :src="lead.imageUrl" :alt="lead.title" :loading="eager ? 'eager' : 'lazy'" decoding="async">
            </span>
            <span class="tm-spotlight__lead-body">
                <Badge v-if="lead.badge" :tone="lead.badge.type">{{ lead.badge.label }}</Badge>
                <h3 class="tm-spotlight__lead-title">{{ lead.title }}</h3>
                <p v-if="lead.description" class="tm-spotlight__excerpt">{{ lead.description }}</p>
                <span class="tm-spotlight__by">{{ postByline(lead, locale) }}</span>
            </span>
        </NuxtLink>

        <ol v-if="rest.length" class="tm-spotlight__list">
            <li v-for="(post, index) in rest" :key="post.uuid">
                <NuxtLink :to="localePath(post.href ?? '/blog')" class="tm-spotlight__item">
                    <span class="tm-spotlight__number">{{ String(index + 2).padStart(2, '0') }}</span>
                    <span class="tm-spotlight__item-body">
                        <span class="tm-spotlight__item-title">{{ post.title }}</span>
                        <span class="tm-spotlight__by">{{ postByline(post, locale) }}</span>
                    </span>
                    <span v-if="post.imageUrl" class="tm-spotlight__thumb">
                        <img :src="post.imageUrl" alt="" loading="lazy" decoding="async">
                    </span>
                </NuxtLink>
            </li>
        </ol>
    </div>
</template>

<script setup lang="ts">
import Badge from '~/shared/components/badge/Badge.vue'
import { postByline } from '~/shared/helpers/byline'
import type { IPostSpotlightProps } from './PostSpotlight.d'

const props = defineProps<IPostSpotlightProps>()

const { locale } = useI18n()
const localePath = useLocalePath()

const lead = computed(() => props.items[0] ?? null)
const rest = computed(() => props.items.slice(1))
</script>

<style lang="scss">
@use './_post-spotlight.scss';
</style>
