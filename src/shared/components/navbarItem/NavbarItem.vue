<template>
    <component
        :is="disabled ? 'span' : NuxtLink"
        v-bind="disabled ? { 'aria-disabled': 'true' } : { to: localePath(to ?? '') }"
        class="tm-navbar-item"
        :class="{ 'is-active': active, 'is-disabled': disabled }"
        :title="label"
        :aria-current="active ? 'page' : undefined"
    >
        <span class="tm-navbar-item__icon">
            <Icon v-if="icon" :name="icon" :size="18" />
            <span v-if="badge" class="tm-navbar-item__dot" aria-hidden="true" />
        </span>

        <span class="tm-navbar-item__label">{{ label }}</span>

        <span v-if="badge" class="tm-navbar-item__badge" :class="{ 'is-accent': accent }">{{ badge }}</span>
    </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import type { INavbarItemProps } from './NavbarItem.d'

defineProps<INavbarItemProps>()

const localePath = useLocalePath()
</script>

<style lang="scss">
@use './_navbar-item.scss';
</style>
