<template>
    <p v-if="!rows.length" class="tm-bar-list__empty">{{ empty }}</p>

    <ul v-else class="tm-bar-list">
        <Tooltip v-for="row in rows" :key="row.key" tag="li" :text="row.hint ?? ''" :disabled="!row.hint" align="end" class="tm-bar-list__row">
            <span class="tm-bar-list__label">{{ row.label }}</span>
            <span class="tm-bar-list__track" aria-hidden="true">
                <span class="tm-bar-list__bar" :style="{ width: `${width(row.value)}%` }" />
            </span>
            <span class="tm-bar-list__value">{{ row.display }}</span>
        </Tooltip>
    </ul>
</template>

<script setup lang="ts">
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
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

    &__track {
        display: block;
        overflow: hidden;
        height: 8px;
        border-radius: radius('pill');
        background: color-mix(in srgb, var(--tm-ink-1) 6%, transparent);
    }

    &__bar {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--tm-cms-accent, var(--tm-ink-1));
        transition: width .5s cubic-bezier(.32, .72, 0, 1), opacity .2s ease;
    }

    &__value {
        min-width: 56px;
        font-size: size(13);
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--tm-ink-1);
        text-align: right;
    }

    &__row:hover &__bar { opacity: .82; }

    &__empty {
        margin: 0;
        padding: 14px 0;
        font-size: size(13);
        color: var(--tm-ink-4);
    }
}
</style>
