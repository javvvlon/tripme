<template>
    <header class="tm-section-head">
        <div>
            <component :is="`h${level}`" class="tm-section-head__title">{{ title }}</component>
            <p v-if="sub" class="tm-section-head__sub">{{ sub }}</p>
        </div>
        <div v-if="$slots.aside" class="tm-section-head__aside">
            <slot name="aside" />
        </div>
    </header>
</template>

<script setup lang="ts">
import type { ISectionHeadProps } from './SectionHead.d'

withDefaults(defineProps<ISectionHeadProps>(), { level: 2 })
</script>

<style lang="scss">
@use './_section-head.scss';
</style>
