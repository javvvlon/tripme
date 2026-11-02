<template>
    <div class="tm-contact-page">
        <ContactPanel />
    </div>
</template>

<script setup lang="ts">
import ContactPanel from '~/landing/components/contactPanel/ContactPanel.vue'
import { useTravelAgencySchema } from '~/shared/composables/useTravelAgencySchema'

const { t } = useI18n()
const agency = useTravelAgencySchema()

useSeoMeta({
    title: () => t('contact.seo.title'),
    description: () => t('contact.seo.description'),
})

useHead(() => ({
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(agency.value) }],
}))
</script>

<style lang="scss">
@use './_contact.scss';
</style>
