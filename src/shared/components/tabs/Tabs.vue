<template>
    <div ref="root" class="tm-tabs" :class="[`tm-tabs--${variant}`, { 'has-thumb': thumb.width > 0 }]" :style="{ '--tm-thumb-x': `${thumb.x}px`, '--tm-thumb-w': `${thumb.width}px` }" role="tablist" :aria-label="ariaLabel">
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
            <span
                v-if="tab.count !== undefined"
                class="tm-tabs__count" :class="{ 'is-attention': tab.attention && tab.count > 0 }"
            >{{ tab.count }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { ITabsProps } from './Tabs.d'

const props = withDefaults(defineProps<ITabsProps>(), { variant: 'pill' })

const model = defineModel<string>({ required: true })

const tabs = useTemplateRef<HTMLElement[]>('tab')

const root = useTemplateRef<HTMLElement>('root')

const thumb = reactive({ x: 0, width: 0 })

function measure() {
  const index = props.items.findIndex(item => item.value === model.value)
  const active = index >= 0 ? tabs.value?.[index] : undefined

  thumb.x = active?.offsetLeft ?? 0
  thumb.width = active?.offsetWidth ?? 0
}

watch(() => [model.value, props.items.length], () => nextTick(measure))

onMounted(() => {
  measure()

  if (typeof ResizeObserver === 'undefined' || !root.value) return

  const observer = new ResizeObserver(measure)

  observer.observe(root.value)
  onBeforeUnmount(() => observer.disconnect())
})

function move(index: number, direction: 1 | -1) {
  const next = (index + direction + props.items.length) % props.items.length
  model.value = props.items[next]!.value
  nextTick(() => tabs.value?.[next]?.focus())
}
</script>

<style lang="scss">
@use './_tabs.scss';
</style>
