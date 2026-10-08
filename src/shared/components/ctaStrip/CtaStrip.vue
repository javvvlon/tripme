<template>
    <aside class="tm-cta-strip" :class="`is-${tone}`">
        <div class="tm-cta-strip__text">
            <h2 class="tm-cta-strip__title">{{ title }}</h2>
            <p v-if="text" class="tm-cta-strip__lead">{{ text }}</p>
        </div>

        <Button
            v-if="ctaLabel && link"
            v-bind="linkProps(link)"
            :variant="tone === 'light' ? 'primary' : 'secondary'"
            size="lg" icon-right="arrow-right"
            class="tm-cta-strip__cta"
        >
            {{ ctaLabel }}
        </Button>
    </aside>
</template>

<script setup lang="ts">
import { linkProps } from '~/shared/helpers/link'
import type { ICtaStripProps } from './CtaStrip.d'

withDefaults(defineProps<ICtaStripProps>(), { tone: 'brand' })
</script>

<style lang="scss">
@use './_cta-strip.scss';
</style>
