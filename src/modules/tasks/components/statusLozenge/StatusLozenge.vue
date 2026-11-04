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
    background: #E5E5E5;
    color: #404040;
    font-size: size(11);
    font-weight: 700;
    letter-spacing: .03em;
    line-height: 16px;
    text-transform: uppercase;
    white-space: nowrap;

    &.is-in_progress { background: #FFF1E6; color: #8F3C00; }
    &.is-review { background: #FCEBC6; color: #7A4B00; }
    &.is-done { background: #F0FDF4; color: #166534; }
}
</style>
