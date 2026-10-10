<template>
    <article class="tm-media-text" :class="[`is-${side}`, { 'has-image': imageUrl }]">
        <figure v-if="imageUrl" class="tm-media-text__media">
            <Photo :photo="{ src: imageUrl, alt: title ?? '' }" ratio="4 / 3" :eager="eager" sizes="(max-width: 900px) 100vw, 560px" />
        </figure>

        <div class="tm-media-text__text">
            <h2 class="tm-media-text__title">{{ title }}</h2>
            <div v-if="html" class="tm-media-text__body" v-html="html" />
            <Button
                v-if="ctaLabel && link"
                v-bind="linkProps(link)"
                variant="primary" size="md" icon-right="arrow-right"
                class="tm-media-text__cta"
            >
                {{ ctaLabel }}
            </Button>
        </div>
    </article>
</template>

<script setup lang="ts">
import { linkProps } from '~/shared/helpers/link'
import { renderMarkdown } from '~/shared/helpers/markdown'
import type { IMediaTextProps } from './MediaText.d'

const props = withDefaults(defineProps<IMediaTextProps>(), { side: 'left' })

const html = computed(() => renderMarkdown(props.body))
</script>

<style lang="scss">
@use './_media-text.scss';
</style>
