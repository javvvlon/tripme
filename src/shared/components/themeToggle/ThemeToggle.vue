<template>
    <button
        type="button" class="tm-theme-toggle"
        :aria-label="t('theme.toggle')" :title="t('theme.toggle')"
        @click="toggle"
    >
        <Icon class="tm-theme-toggle__sun" name="sun" :size="18" />
        <Icon class="tm-theme-toggle__moon" name="moon" :size="18" />
    </button>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { toggle } = useTheme()
</script>

<style lang="scss">
@use './_theme-toggle.scss';
</style>
