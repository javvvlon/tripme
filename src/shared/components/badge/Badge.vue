<template>
    <span class="tm-badge" :class="`tm-badge--${tone}`"><slot /></span>
</template>

<script setup lang="ts">
import type { IBadgeProps } from './Badge.d'

withDefaults(defineProps<IBadgeProps>(), { tone: 'deal' })
</script>

<style lang="scss">
@use './_badge.scss';
</style>
