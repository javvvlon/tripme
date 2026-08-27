<template>
    <div class="tm-tabs" :class="`tm-tabs--${variant}`" role="tablist" :aria-label="ariaLabel">
        <button
            v-for="(tab, i) in items" :key="tab.value" ref="tab"
            type="button" role="tab"
            :aria-selected="model === tab.value"
            :tabindex="model === tab.value ? 0 : -1"
            class="tm-tabs__tab" :class="{ 'is-active': model === tab.value }"
            @click="model = tab.value"
            @keydown.right.prevent="move(i, 1)"
            @keydown.left.prevent="move(i, -1)"
        >
            <Icon v-if="tab.icon" :name="tab.icon" :size="17" />
            {{ tab.label }}
        </button>
    </div>
</template>

<script setup lang="ts">
import type { ITabsProps } from './Tabs.d'

const props = withDefaults(defineProps<ITabsProps>(), { variant: 'pill' })

const model = defineModel<string>({ required: true })

const tabs = useTemplateRef<HTMLElement[]>('tab')

function move(index: number, direction: 1 | -1) {
  const next = (index + direction + props.items.length) % props.items.length
  model.value = props.items[next]!.value
  nextTick(() => tabs.value?.[next]?.focus())
}
</script>

<style lang="scss">
@use './_tabs.scss';
</style>
