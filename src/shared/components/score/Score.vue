<template>
    <span class="tm-score">
        <span class="tm-score__value">{{ value.toFixed(1) }}</span>
        <span v-if="label || source" class="tm-score__text">
            <span v-if="label" class="tm-score__label">{{ label }}</span>
            <span v-if="source" class="tm-score__source">{{ source }}</span>
        </span>
    </span>
</template>

<script setup lang="ts">
import type { IScoreProps } from './Score.d'

defineProps<IScoreProps>()
</script>

<style lang="scss">
@use './_score.scss';
</style>
