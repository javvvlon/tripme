<template>
    <aside class="tm-sidebar" :class="{ 'is-collapsed': collapsed }">
        <div class="tm-sidebar__head">
            <div class="tm-sidebar__brand"><slot name="brand" /></div>

            <button
                type="button" class="tm-sidebar__collapse"
                :aria-label="collapseLabel ?? t('cms.nav.collapse')"
                :aria-expanded="!collapsed"
                @click="collapsed = !collapsed"
            >
                <Icon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="18" />
            </button>
        </div>

        <nav class="tm-sidebar__nav" :aria-label="ariaLabel ?? t('cms.nav.label')">
            <slot />
        </nav>

        <div v-if="$slots.footer" class="tm-sidebar__foot">
            <slot name="footer" />
        </div>
    </aside>
</template>

<script setup lang="ts">
import type { ISidebarProps } from './Sidebar.d'

defineProps<ISidebarProps>()

const collapsed = defineModel<boolean>('collapsed', { default: false })

const { t } = useI18n()
</script>

<style lang="scss">
@use './_sidebar.scss';
</style>
