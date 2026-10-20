<template>
    <div class="tm-shared-ad">
        <header class="tm-shared-ad__hero" :class="{ 'has-image': selection?.background_url }">
            <img
                v-if="selection?.background_url"
                :src="selection.background_url" alt=""
                class="tm-shared-ad__image" fetchpriority="high"
            >

            <div class="tm-shared-ad__hero-inner container-wide">
                <span v-if="copy?.kicker" class="tm-shared-ad__kicker">{{ copy.kicker }}</span>
                <h1 class="tm-shared-ad__title">{{ headline }}</h1>
                <p v-if="facts" class="tm-shared-ad__facts">{{ facts }}</p>
                <p v-if="copy?.intro" class="tm-shared-ad__intro">{{ copy.intro }}</p>
            </div>
        </header>

        <div class="tm-shared-ad__body container-wide">
            <EditorSkeleton v-if="status === 'pending' && !selection" variant="rows" />

            <div v-else-if="!tours.length" class="tm-shared-ad__empty">
                <p>{{ t('marketing.page.empty') }}</p>
                <Button :to="localePath('/search')" icon-right="arrow-right">{{ t('marketing.page.emptyCta') }}</Button>
            </div>

            <template v-else>
                <p v-if="checked" class="tm-shared-ad__checked">
                    <Icon name="check" :size="14" :stroke="2.4" />{{ checked }}
                </p>

                <ul class="tm-shared-ad__list">
                    <li v-for="item in tours" :key="item.trip.offer_id">
                        <TourCard :tour="item.tour" :route="item.route" :campaign="code" />
                    </li>
                </ul>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import { useSharedSelection } from './SharedSelection.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { selection, status, copy, tours, headline, facts, checked, code } = useSharedSelection()

useSeoMeta({
    title: () => `${headline.value} — TripMe`,
    description: () => copy.value?.intro || facts.value,
    ogTitle: () => headline.value,
    ogDescription: () => copy.value?.intro || facts.value,
    ogImage: () => selection.value?.background_url || undefined,
    robots: 'noindex, follow',
})
</script>

<style lang="scss">
@use './_shared-selection.scss';
</style>
