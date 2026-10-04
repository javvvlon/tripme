<template>
    <article class="tm-legal container">
        <Breadcrumbs :items="breadcrumbs" class="tm-legal__crumbs" />

        <div v-if="status === 'pending'" class="tm-legal__sheet">
            <Skeleton height="30px" width="60%" />
            <Skeleton height="15px" :lines="8" />
        </div>

        <div v-else class="tm-legal__sheet">
            <h1 class="tm-legal__title">{{ title }}</h1>

            <p v-if="updated" class="tm-legal__updated">{{ t('legalPage.updated', { date: updated }) }}</p>

            <div v-if="page" class="tm-legal__body" v-html="body" />

            <div v-else class="tm-legal__pending">
                <p>{{ t('legalPage.pending') }}</p>
                <Button to="/contact" variant="secondary" icon-right="arrow-right">
                    {{ t('legalPage.ask') }}
                </Button>
            </div>

            <p class="tm-legal__agent">{{ t('legalPage.agentStatus') }}</p>
        </div>
    </article>
</template>

<script setup lang="ts">
import { renderMarkdown } from '~/shared/helpers/markdown'
import { useLegalPage } from './Legal.hooks'

const { t, locale } = useI18n()

const { doc, page, status } = useLegalPage()

const title = computed(() => page.value?.title || t(`legal.${doc.value}`))

const body = computed(() => renderMarkdown(page.value?.body))

const updated = computed(() => {
    const value = page.value?.publishedAt

    return value ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }).format(new Date(value)) : ''
})

const breadcrumbs = computed(() => [
    { label: t('nav.homeShort'), to: '/' },
    { label: t(`legal.${doc.value}`) },
])

useSeoMeta({
    title: () => `${title.value} — TripMe`,
    robots: () => (page.value ? 'index, follow' : 'noindex, follow'),
})
</script>

<style lang="scss">
@use './_legal.scss';
</style>
