<template>
    <svg
        class="tm-icon"
        :width="px" :height="px" viewBox="0 0 24 24"
        aria-hidden="true" focusable="false"
        :fill="filled ? 'currentColor' : 'none'"
        :stroke="filled ? 'none' : 'currentColor'"
        :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round"
    >
        <path :d="d" />
    </svg>
</template>

<script setup lang="ts">
import type { IIconProps } from './Icon.d'
import { ICON_FALLBACK, ICON_PATHS } from './Icon.config'

const props = withDefaults(defineProps<IIconProps>(), {
  size: 20,
  filled: false,
  stroke: 1.7,
})

const d = computed(() => ICON_PATHS[props.name] ?? ICON_PATHS[ICON_FALLBACK]!)
const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<style lang="scss">
@use './_icon.scss';
</style>
