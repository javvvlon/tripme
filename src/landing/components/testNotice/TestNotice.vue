<template>
    <aside class="tm-test-notice" role="status">
        <span class="tm-test-notice__dot" aria-hidden="true" />
        {{ t('testNotice.text') }}
    </aside>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style lang="scss">
@use './_test-notice.scss';
</style>
