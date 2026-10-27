<template>
    <Tooltip :text="label" side="right" :disabled="!compact" class="tm-navbar-item__tip">
        <component
            :is="disabled ? 'span' : NuxtLink"
            v-bind="{ ...$attrs, ...(disabled ? { 'aria-disabled': 'true' } : { to: localePath(to ?? '') }) }"
            class="tm-navbar-item"
            :class="{ 'is-active': active, 'is-disabled': disabled }"
            :aria-label="compact ? label : undefined"
            :aria-current="active ? 'page' : undefined"
        >
            <span class="tm-navbar-item__icon">
                <Icon v-if="icon" :name="icon" :size="18" />
                <span v-if="badge" class="tm-navbar-item__dot" aria-hidden="true" />
            </span>

            <span class="tm-navbar-item__label">{{ label }}</span>

            <span v-if="badge" class="tm-navbar-item__badge" :class="{ 'is-accent': accent }">{{ badge }}</span>
        </component>
    </Tooltip>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
import type { INavbarItemProps } from './NavbarItem.d'

defineOptions({ inheritAttrs: false })

defineProps<INavbarItemProps>()

const localePath = useLocalePath()
</script>

<style lang="scss">
@use './_navbar-item.scss';
</style>
