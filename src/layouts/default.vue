<template>
    <div class="tm-shell">
        <SiteHeader :variant="header" :with-search="withSearch" />
        <main class="tm-shell__main"><slot /></main>
        <SiteFooter />

        <ModalHost />
        <ToastHost />
    </div>
</template>

<script setup lang="ts">
import SiteHeader from '~/landing/components/siteHeader/SiteHeader.vue'
import SiteFooter from '~/landing/components/siteFooter/SiteFooter.vue'
import ModalHost from '~/shared/components/modalHost/ModalHost.vue'
import ToastHost from '~/shared/components/toastHost/ToastHost.vue'

const route = useRoute()

const header = computed(() => (route.meta.header === 'over' ? 'over' : 'solid'))
const withSearch = computed(() => route.meta.headerSearch === true)
</script>

<style lang="scss">
.tm-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--tm-surface-2);

    &__main { flex: 1; }
}
</style>
