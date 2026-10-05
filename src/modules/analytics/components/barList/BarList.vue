<template>
    <p v-if="!rows.length" class="tm-bar-list__empty">{{ empty }}</p>

    <ul v-else class="tm-bar-list">
        <li v-for="row in rows" :key="row.key" class="tm-bar-list__row" :title="row.hint || undefined">
            <span class="tm-bar-list__label">{{ row.label }}</span>
            <span class="tm-bar-list__track" aria-hidden="true">
                <span class="tm-bar-list__bar" :style="{ width: `${width(row.value)}%` }" />
            </span>
            <span class="tm-bar-list__value">{{ row.display }}</span>
            <span v-if="row.hint" class="tm-bar-list__hint" role="tooltip">{{ row.hint }}</span>
        </li>
    </ul>
</template>

<script setup lang="ts">
import type { IBarListProps } from './BarList.d'

const props = defineProps<IBarListProps>()

const top = computed(() => Math.max(0, ...props.rows.map(row => row.value)))

const width = (value: number) => (top.value ? Math.max(2, (value / top.value) * 100) : 0)
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-bar-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;

    &__row {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 34%) minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 3px 0;
    }

    &__label {
        overflow: hidden;
        font-size: size(13);
        color: var(--tm-ink-2);
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    &__track { display: block; height: 10px; }

    &__bar {
        display: block;
        height: 100%;
        border-radius: 0 4px 4px 0;
        background: var(--tm-brand-secondary);
        transition: width .3s ease;
    }

    &__value {
        min-width: 56px;
        font-size: size(13);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--tm-ink-1);
        text-align: right;
    }

    &__hint {
        position: absolute;
        z-index: 5;
        right: 0;
        bottom: calc(100% + 4px);
        padding: 6px 9px;
        border-radius: radius('sm');
        background: var(--tm-common-night);
        color: var(--tm-common-white);
        font-size: size(12);
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity .12s;
    }

    &__row:hover &__hint { opacity: 1; }
    &__row:hover &__bar { background: var(--tm-brand-secondary-dark); }

    &__empty {
        margin: 0;
        padding: 14px 0;
        font-size: size(13);
        color: var(--tm-ink-4);
    }
}
</style>
