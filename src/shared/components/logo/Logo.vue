<template>
    <svg
        class="tm-logo" :class="`tm-logo--${variant}`"
        :viewBox="box.viewBox" :width="width" :height="height"
        role="img" :aria-label="label"
        fill-rule="evenodd"
    >
        <path v-if="variant === 'full'" class="tm-logo__trip" :d="LOGO_TRIP" />
        <path v-if="variant === 'full'" class="tm-logo__me" :d="LOGO_ME" />
        <path v-for="(d, i) in LOGO_SUITCASE" :key="i" class="tm-logo__suitcase" :d="d" />
    </svg>
</template>

<script setup lang="ts">
import { BRAND_NAME } from '~/shared/config/brand'
import type { ILogoProps } from './Logo.d'
import { LOGO_BOX, LOGO_ME, LOGO_SUITCASE, LOGO_TRIP } from './Logo.config'

const props = withDefaults(defineProps<ILogoProps>(), {
  variant: 'full',
  width: 160,
  label: BRAND_NAME,
})

const box = computed(() => LOGO_BOX[props.variant])
const height = computed(() => Math.round(props.width / box.value.ratio))
</script>

<style lang="scss">
@use './_logo.scss';
</style>
