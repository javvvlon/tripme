<template>
    <component
        :is="disabled ? 'span' : NuxtLink" v-bind="disabled ? { 'aria-disabled': 'true' } : { to: localePath(to ?? '') }"
        class="tm-nested-navbar-item"
        :class="{ 'is-active': active, 'is-disabled': disabled }"
    >
        <Icon :name="icon ?? 'folder'" :size="19" class="tm-nested-navbar-item__icon" />
        <span class="tm-nested-navbar-item__label">{{ label }}</span>
    </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import type { INestedNavbarItemProps } from './NestedNavbarItem.d'

defineProps<INestedNavbarItemProps>()

const localePath = useLocalePath()
</script>

<style lang="scss">
@use './_nested-navbar-item.scss';
</style>
