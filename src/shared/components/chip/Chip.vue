<template>
    <component
        :is="to ? NuxtLink : 'button'"
        :to="to ? localePath(to) : undefined"
        :type="to ? undefined : 'button'"
        class="tm-chip"
        :class="[`tm-chip--${tone}`, { 'tm-chip--active': active }]"
        :aria-pressed="to ? undefined : active"
    >
        <Icon v-if="icon" :name="icon" :size="16" />
        <slot />
    </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import type { IChipProps } from './Chip.d'

withDefaults(defineProps<IChipProps>(), { tone: 'onLight' })

const localePath = useLocalePath()
</script>

<style lang="scss">
@use './_chip.scss';
</style>
