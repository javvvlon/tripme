<template>
    <span class="tm-status-dot" :class="`is-${status}`">{{ t(`cms.tasks.status.${status}`) }}</span>
</template>

<script setup lang="ts">
import type { IStatusLozengeProps } from './StatusLozenge.d'

defineProps<IStatusLozengeProps>()

const { t } = useI18n()
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-status-dot {
    --tm-status: #C8CDD5;

    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--tm-ink-1);
    font-size: size(13);
    white-space: nowrap;

    &::before {
        content: '';
        flex: none;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--tm-status);
    }

    &.is-todo { --tm-status: #6B7689; }
    &.is-in_progress { --tm-status: #0B192C; }
    &.is-review { --tm-status: #C98A00; }
    &.is-done { --tm-status: #1F6F78; color: #6B7689; }
}
</style>
