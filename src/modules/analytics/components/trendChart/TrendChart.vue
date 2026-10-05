<template>
    <figure class="tm-trend" :aria-label="caption">
        <div class="tm-trend__plot">
            <div class="tm-trend__grid" aria-hidden="true">
                <span v-for="tick in ticks" :key="tick" class="tm-trend__tick" :style="{ bottom: `${(tick / scale) * 100}%` }">
                    <em>{{ tick }}</em>
                </span>
            </div>

            <div class="tm-trend__columns">
                <div
                    v-for="point in points" :key="point.key"
                    class="tm-trend__slot" tabindex="0"
                    :aria-label="point.tooltip.join(', ')"
                >
                    <span class="tm-trend__column" :style="{ height: `${scale ? (point.value / scale) * 100 : 0}%` }" />
                    <span class="tm-trend__tip" role="tooltip">
                        <strong>{{ point.tooltip[0] }}</strong>
                        <span v-for="line in point.tooltip.slice(1)" :key="line">{{ line }}</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="tm-trend__axis" aria-hidden="true">
            <span v-for="(point, index) in points" :key="point.key" class="tm-trend__axis-label">
                {{ showLabel(index) ? point.label : '' }}
            </span>
        </div>
    </figure>
</template>

<script setup lang="ts">
import type { ITrendChartProps } from './TrendChart.d'

const props = defineProps<ITrendChartProps>()

const niceStep = (max: number): number => {
  if (max <= 4) return 1

  const raw = max / 4
  const power = 10 ** Math.floor(Math.log10(raw))

  return [1, 2, 5, 10].map(f => f * power).find(step => step >= raw) ?? power * 10
}

const top = computed(() => Math.max(0, ...props.points.map(point => point.value)))

const step = computed(() => niceStep(top.value))

const scale = computed(() => Math.max(step.value, Math.ceil(top.value / step.value) * step.value))

const ticks = computed(() => {
  const list: number[] = []

  for (let value = 0; value <= scale.value; value += step.value) list.push(value)

  return list
})

const every = computed(() => Math.max(1, Math.ceil(props.points.length / 10)))

const showLabel = (index: number) => index % every.value === 0 || index === props.points.length - 1
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-trend {
    margin: 0;

    &__plot {
        position: relative;
        height: 180px;
        margin-left: 28px;
    }

    &__grid { position: absolute; inset: 0; }

    &__tick {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px solid var(--tm-border-2);

        em {
            position: absolute;
            left: -28px;
            top: -8px;
            width: 22px;
            font-size: size(11);
            font-style: normal;
            font-variant-numeric: tabular-nums;
            color: var(--tm-ink-4);
            text-align: right;
        }
    }

    &__columns {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: flex-end;
        gap: 2px;
    }

    &__slot {
        position: relative;
        display: flex;
        flex: 1;
        align-items: flex-end;
        justify-content: center;
        height: 100%;
        min-width: 0;
        outline: none;

        &:hover,
        &:focus-visible { background: var(--tm-surface-2); }
    }

    &__column {
        display: block;
        width: min(24px, 70%);
        min-height: 0;
        border-radius: 4px 4px 0 0;
        background: var(--tm-brand-secondary);
    }

    &__tip {
        position: absolute;
        z-index: 5;
        bottom: calc(100% + 6px);
        left: 50%;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 7px 10px;
        border-radius: radius('sm');
        background: var(--tm-common-night);
        color: var(--tm-common-white);
        font-size: size(12);
        white-space: nowrap;
        transform: translateX(-50%);
        opacity: 0;
        pointer-events: none;
        transition: opacity .12s;
    }

    &__slot:hover &__tip,
    &__slot:focus-visible &__tip { opacity: 1; }

    &__slot:first-child &__tip { left: 0; transform: none; }
    &__slot:last-child &__tip { left: auto; right: 0; transform: none; }

    &__axis {
        display: flex;
        gap: 2px;
        margin: 6px 0 0 28px;
    }

    &__axis-label {
        flex: 1;
        min-width: 0;
        overflow: visible;
        font-size: size(11);
        color: var(--tm-ink-4);
        text-align: center;
        white-space: nowrap;
    }
}
</style>
