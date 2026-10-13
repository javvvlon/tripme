<template>
    <span class="tm-info-tip" :class="`tm-info-tip--${side}`">
        <button type="button" class="tm-info-tip__trigger" :aria-label="text" :aria-describedby="id" @click.prevent>
            <Icon name="help" :size="14" />
        </button>
        <span :id="id" role="tooltip" class="tm-info-tip__bubble">{{ text }}</span>
    </span>
</template>

<script setup lang="ts">
import type { IInfoTipProps } from './InfoTip.d'

withDefaults(defineProps<IInfoTipProps>(), { side: 'top' })

const id = useId()
</script>

<style lang="scss">
@use './_info-tip.scss';
</style>
