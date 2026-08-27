<template>
    <div v-if="lines && lines > 1" class="tm-skeleton__lines" aria-hidden="true">
        <span
            v-for="line in lines" :key="line"
            class="tm-skeleton"
            :class="radius ? `tm-skeleton--${radius}` : null"
            :style="{ width: line === lines ? '65%' : width, height }"
        />
    </div>

    <span
        v-else
        class="tm-skeleton"
        :class="radius ? `tm-skeleton--${radius}` : null"
        :style="{ width, height }"
        aria-hidden="true"
    />
</template>

<script setup lang="ts">
import type { ISkeletonProps } from './Skeleton.d'

withDefaults(defineProps<ISkeletonProps>(), { width: '100%', height: '14px' })
</script>

<style lang="scss">
@use './_skeleton.scss';
</style>
