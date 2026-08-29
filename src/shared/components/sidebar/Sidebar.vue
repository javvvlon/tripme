<template>
    <aside class="tm-sidebar">
        <div class="tm-sidebar__head">
            <div class="tm-sidebar__brand"><slot name="brand" /></div>
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

const { t } = useI18n()
</script>

<style lang="scss">
@use './_sidebar.scss';
</style>
