<template>
    <span class="tm-lozenge" :class="`is-${status}`">{{ t(`cms.tasks.status.${status}`) }}</span>
</template>

<script setup lang="ts">
import type { IStatusLozengeProps } from './StatusLozenge.d'

defineProps<IStatusLozengeProps>()

const { t } = useI18n()
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-lozenge {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 2px 6px;
    border-radius: 4px;
    background: #E4E7EC;
    color: #44546F;
    font-size: size(11);
    font-weight: 700;
    letter-spacing: .03em;
    line-height: 16px;
    text-transform: uppercase;
    white-space: nowrap;

    &.is-in_progress { background: #DCE6F5; color: #0B3A75; }
    &.is-review { background: #FCEBC6; color: #7A4B00; }
    &.is-done { background: #DCFFF1; color: #216E4E; }
}
</style>
