<template>
    <div class="tm-spinner" role="status" :aria-label="label || t('common.loading')">
        <svg class="tm-spinner__ring" :width="size" :height="size" viewBox="0 0 44 44" aria-hidden="true">
            <circle class="tm-spinner__track" cx="22" cy="22" r="18" fill="none" stroke-width="4" />
            <circle class="tm-spinner__arc" cx="22" cy="22" r="18" fill="none" stroke-width="4" stroke-linecap="round" />
        </svg>
    </div>
</template>

<script setup lang="ts">
import type { ISpinnerProps } from './Spinner.d'

withDefaults(defineProps<ISpinnerProps>(), { size: 44 })

const { t } = useI18n()
</script>

<style lang="scss">
@use './_spinner.scss';
</style>
