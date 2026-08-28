<template>
    <component
        :is="linkable ? NuxtLink : 'article'"
        v-bind="linkable ? { to: localePath(item.href!) } : {}"
        class="tm-content-card" :class="[`is-${props.shape ?? 'fill'}`, { 'is-compact': props.compact, 'is-link': linkable }]"
    >
        <div class="tm-content-card__frame">
            <Photo
                :photo="{ src: item.imageUrl, alt: '' }"
                ratio="auto"
                :eager="eager"
                sizes="(max-width: 720px) 100vw, 560px"
                class="tm-content-card__media"
            />

            <Badge v-if="item.badge" :tone="item.badge.type" class="tm-content-card__badge">
                {{ item.badge.label }}
            </Badge>
        </div>

        <span v-if="linkable" class="tm-content-card__go" aria-hidden="true">
            <Icon name="arrow-right" :size="18" />
        </span>

        <div class="tm-content-card__body">
            <h3 class="tm-content-card__title">{{ item.title }}</h3>
            <p v-if="item.description" class="tm-content-card__text">{{ item.description }}</p>
        </div>
    </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import type { IContentCardProps } from './ContentCard.d'

const props = defineProps<IContentCardProps>()

const localePath = useLocalePath()
const routeExists = useRouteExists()

const linkable = computed(() => Boolean(props.item.href) && routeExists(props.item.href!))
</script>

<style lang="scss">
@use './_content-card.scss';
</style>
