<template>
    <component
        :is="tag"
        :to="to ? localePath(to) : undefined"
        :href="href"
        :type="to || href ? undefined : type"
        :disabled="to || href ? undefined : disabled"
        :aria-disabled="(to || href) && disabled ? 'true' : undefined"
        class="tm-button"
        :class="[
            `tm-button--${variant}`,
            `tm-button--${size}`,
            { 'tm-button--block': block, 'tm-button--disabled': disabled },
        ]"
    >
        <Icon v-if="icon" :name="icon" :size="size === 'lg' ? 20 : 18" />
        <span v-if="$slots.default"><slot /></span>
        <Icon v-if="iconRight" :name="iconRight" :size="size === 'lg' ? 20 : 18" />
    </component>
</template>

<script setup lang="ts">
import type { IButtonProps } from './Button.d'

const props = withDefaults(defineProps<IButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const localePath = useLocalePath()

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))
</script>

<style lang="scss">
@use './_button.scss';
</style>
