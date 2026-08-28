<template>
    <div class="tm-contact-page">
        <ContactPanel />
    </div>
</template>

<script setup lang="ts">
import ContactPanel from '~/landing/components/contactPanel/ContactPanel.vue'

const { t } = useI18n()

useSeoMeta({
    title: () => t('contact.seo.title'),
    description: () => t('contact.seo.description'),
})
</script>

<style lang="scss">
@use './_contact.scss';
</style>
