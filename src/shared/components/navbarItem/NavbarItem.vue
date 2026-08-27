<template>
    <div class="tm-navbar-item">
        <component
            :is="tag" v-bind="attrs"
            class="tm-navbar-item__control"
            :class="{ 'is-active': active, 'is-compact': compact, 'is-disabled': disabled }"
            :title="compact ? label : undefined"
        >
            <Icon v-if="icon" :name="icon" :size="21" class="tm-navbar-item__icon" />

            <span v-if="!compact" class="tm-navbar-item__label">{{ label }}</span>

            <Icon
                v-if="expandable && !compact"
                name="chevron" :size="18"
                class="tm-navbar-item__chevron" :class="{ 'is-open': expanded }"
            />
        </component>

        <div v-if="$slots.default && !compact" v-show="expanded" class="tm-navbar-item__children">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'
import type { INavbarItemProps } from './NavbarItem.d'

const props = defineProps<INavbarItemProps>()

const expanded = defineModel<boolean>('expanded', { default: false })

const localePath = useLocalePath()

const tag = computed(() => {
  if (props.disabled) return 'span'

  return props.to ? resolveComponent('NuxtLink') : 'button'
})

const attrs = computed(() => {
  if (props.disabled) return { 'aria-disabled': 'true' }
  if (props.to) return { to: localePath(props.to) }

  return {
    'type': 'button',
    'aria-expanded': String(expanded.value),
    'onClick': () => { expanded.value = !expanded.value },
  }
})
</script>

<style lang="scss">
@use './_navbar-item.scss';
</style>
