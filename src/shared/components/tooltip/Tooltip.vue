<template>
    <span class="tm-tooltip" :class="[`tm-tooltip--${side}`, `tm-tooltip--${align}`]">
        <slot v-bind="{ tipId: id }" />
        <span v-if="!disabled" :id="id" role="tooltip" class="tm-tooltip__bubble">{{ text }}</span>
    </span>
</template>

<script setup lang="ts">
import type { ITooltipProps } from './Tooltip.d'

withDefaults(defineProps<ITooltipProps>(), { side: 'top', align: 'center', disabled: false })

const id = useId()
</script>

<style lang="scss">
@use './_tooltip.scss';
</style>
