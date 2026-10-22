<template>
    <span class="tm-note-stamp" :class="[`is-${tone}`, `is-${size ?? 'sm'}`]">{{ t(`cms.tasks.notes.state.${tone}`) }}</span>
</template>

<script setup lang="ts">
import type { INoteStampProps } from './NoteStamp.d'

defineProps<INoteStampProps>()

const { t } = useI18n()
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-note-stamp {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border: 1px solid currentColor;
    border-radius: 3px;
    box-shadow: inset 0 0 0 2px #FFFFFF, inset 0 0 0 3px currentColor;
    color: #0B192C;
    font-family: var(--tm-font-display-primary);
    font-size: size(11);
    font-weight: 700;
    letter-spacing: .12em;
    line-height: 16px;
    text-transform: uppercase;
    white-space: nowrap;

    &.is-md {
        padding: 5px 12px;
        font-size: size(12);
        line-height: 18px;
    }

    &.is-superseded,
    &.is-archived { color: #8590A2; }

    &.is-superseded { text-decoration: line-through; }

    &.is-pending { color: #AE2E24; }

    &.is-acknowledged { color: #216E4E; }
}
</style>
