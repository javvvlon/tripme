<template>
    <div
        v-if="items.length"
        ref="root"
        class="tm-stage"
        :class="{ 'is-single': count < 2 }"
        role="region" aria-roledescription="carousel" :aria-label="t('carousel.label')"
        @mouseenter="hovered = true" @mouseleave="hovered = false"
        @focusin="focused = true" @focusout="focused = false"
    >
        <div
            class="tm-stage__viewport"
            tabindex="0"
            @keydown="onKey"
            @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" @pointerleave="onUp"
        >
            <div
                class="tm-stage__track"
                :class="{ 'is-jumping': jumping || dragX !== 0 }"
                :style="{ '--cursor': cursor, '--drag': `${dragX}px` }"
                @transitionend="settle"
            >
                <component
                    :is="linkOf(slide.item) ? (external(slide.item) ? 'a' : NuxtLink) : 'div'"
                    v-for="slide in strip" :key="slide.key"
                    v-bind="linkOf(slide.item) ?? {}"
                    class="tm-stage__slide"
                    :class="{ 'is-current': slide.at === cursor }"
                    role="group" aria-roledescription="slide"
                    :aria-label="t('carousel.slide', { n: slide.position + 1, total: count })"
                    :aria-hidden="slide.at !== cursor"
                    :tabindex="slide.at === cursor ? undefined : -1"
                    draggable="false"
                    @click.capture="onSlide($event, slide.at)"
                >
                    <Photo
                        :photo="{ src: slide.item.imageUrl, alt: '' }" ratio="fill"
                        :eager="eager && slide.at === cursor"
                        sizes="(max-width: 720px) 90vw, 960px"
                        class="tm-stage__photo"
                    />

                    <div class="tm-stage__text">
                        <Badge v-if="slide.item.badge" :tone="slide.item.badge.type" class="tm-stage__badge">{{ slide.item.badge.label }}</Badge>
                        <h3 v-if="slide.item.title" class="tm-stage__title">{{ slide.item.title }}</h3>
                        <p v-if="slide.item.description" class="tm-stage__lead">{{ markdownToText(slide.item.description) }}</p>
                        <span v-if="linkOf(slide.item)" class="tm-stage__go">
                            {{ t('carousel.open') }}
                            <Icon name="arrow-right" :size="16" />
                        </span>
                    </div>
                </component>
            </div>
        </div>

        <div v-if="count > 1" class="tm-stage__bar">
            <span class="tm-stage__count" aria-hidden="true">
                <strong>{{ pad(index + 1) }}</strong> / {{ pad(count) }}
            </span>

            <div class="tm-stage__dots" role="tablist" :aria-label="t('carousel.label')">
                <button
                    v-for="(item, position) in items" :key="item.uuid"
                    type="button" role="tab"
                    class="tm-stage__dot" :class="{ 'is-on': position === index }"
                    :aria-selected="position === index"
                    :aria-label="t('carousel.slide', { n: position + 1, total: count })"
                    @click="go(position)"
                >
                    <span
                        v-if="position === index"
                        :key="index"
                        class="tm-stage__fill"
                        :class="{ 'is-paused': paused }"
                        :style="{ animationDuration: `${SLIDE_MS}ms` }"
                        @animationend="next"
                    />
                </button>
            </div>

            <div class="tm-stage__arrows">
                <button type="button" class="tm-stage__arrow" :aria-label="t('carousel.prev')" @click="prev">
                    <Icon name="chevron-left" :size="18" />
                </button>
                <button type="button" class="tm-stage__arrow" :aria-label="t('carousel.next')" @click="next">
                    <Icon name="chevron-right" :size="18" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { markdownToText } from '~/shared/helpers/markdown'
import type { IContentItem } from '~/modules/content/models/PageContent'
import type { IStageCarouselProps } from './StageCarousel.d'
import { SLIDE_MS } from './StageCarousel.config'
import { useStageCarousel } from './StageCarousel.hooks'

const props = defineProps<IStageCarouselProps>()

const { t } = useI18n()
const localePath = useLocalePath()
const root = useTemplateRef<HTMLElement>('root')

const {
    index, count, cursor, strip, jumping, paused, hovered, focused, dragX,
    go, next, prev, settle, onDown, onMove, onUp, onKey, moved,
} = useStageCarousel(props, root)

const pad = (value: number) => String(value).padStart(2, '0')

const external = (item: IContentItem) => /^https?:\/\//i.test(item.href ?? '')

const linkOf = (item: IContentItem): Record<string, string> | null => {
    const href = item.href?.trim()

    if (!href) return null
    if (external(item)) return { href, target: '_blank', rel: 'noopener' }

    return { to: localePath(href) }
}

function onSlide(event: MouseEvent, at: number) {
    if (moved() || at !== cursor.value) {
        event.preventDefault()
        if (!moved()) cursor.value = at
    }
}
</script>

<style lang="scss">
@use './_stage-carousel.scss';
</style>
