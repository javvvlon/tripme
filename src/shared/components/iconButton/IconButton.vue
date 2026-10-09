<template>
    <button
        type="button" class="tm-icon-button"
        :class="{ 'is-pressed': pressed }"
        :aria-label="badge ? `${label} · ${badge}` : label"
        :title="label"
        :aria-pressed="pressed === undefined ? undefined : pressed"
        :disabled="disabled"
    >
        <Icon :name="icon" :size="18" />
        <span v-if="badge" class="tm-icon-button__badge" aria-hidden="true">{{ badge > 99 ? '99+' : badge }}</span>
    </button>
</template>

<script setup lang="ts">
import type { IIconButtonProps } from './IconButton.d'

defineProps<IIconButtonProps>()
</script>

<style lang="scss">
@use '../../styles/utils' as *;

.tm-icon-button {
    position: relative;
    display: inline-grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--tm-border-1);
    border-radius: radius('sm');
    background: var(--tm-surface-1);
    color: var(--tm-ink-2);
    cursor: pointer;
    transition: border-color .12s ease, color .12s ease, background .12s ease;

    &:hover { border-color: var(--tm-ink-4); color: var(--tm-ink-1); }

    &:focus-visible { outline: 2px solid var(--tm-brand-primary); outline-offset: 2px; }

    &.is-pressed { background: var(--tm-surface-2); color: var(--tm-ink-1); }

    &:disabled { opacity: .5; cursor: default; }

    &__badge {
        position: absolute;
        top: -6px;
        right: -6px;
        display: inline-grid;
        place-items: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border: 2px solid var(--tm-surface-1);
        border-radius: radius('pill');
        background: var(--tm-brand-primary);
        color: var(--tm-common-white);
        font-size: size(11);
        font-weight: 700;
        line-height: 1;
    }
}
</style>
