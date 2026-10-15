<template>
    <span class="tm-headline" :class="`tm-headline--${accent ?? 'pill'}`">{{ parts.lead }}<span class="tm-headline__accent">{{ parts.accent }}</span>{{ parts.tail }}</span>
</template>

<script setup lang="ts">
import { splitHeadline } from '~/shared/helpers/headline'
import type { IHeroHeadlineProps } from './HeroHeadline.d'

const props = defineProps<IHeroHeadlineProps>()

const parts = computed(() => splitHeadline(props.title))
</script>

<style lang="scss">
@use './_hero-headline.scss';
</style>
