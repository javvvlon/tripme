<template>
    <div v-if="page" class="tm-route-page container-wide">
        <Breadcrumbs :items="breadcrumbs" class="tm-route-page__crumbs" />

        <div class="tm-route-page__body">
            <div class="tm-route-page__main">
                <header class="tm-route-page__head">
                    <h1 class="tm-route-page__title">{{ heading }}</h1>
                    <p class="tm-route-page__lead">{{ lead }}</p>
                    <div class="tm-route-page__actions">
                        <Button :to="searchLink" icon-right="arrow-right">{{ t('routes.all') }}</Button>
                        <span v-if="page.offers" class="tm-route-page__count">{{ offers }}</span>
                    </div>
                </header>

                <section v-if="page.hotels.length" class="tm-route-page__hotels" :aria-label="t('routes.hotelsTitle')">
                    <h2 class="tm-route-page__subtitle">{{ t('routes.hotelsTitle') }}</h2>
                    <ul class="tm-route-page__list">
                        <li v-for="tour in page.hotels" :key="tour.get('id')">
                            <TourCard :tour="tour" :agent-view="isStaff" :route="cardRoute" />
                        </li>
                    </ul>
                    <p class="tm-route-page__note">{{ t('routes.note') }}</p>
                </section>

                <div v-else class="tm-route-page__empty">
                    <p>{{ t('routes.empty') }}</p>
                    <Button :to="searchLink" variant="secondary" icon-right="arrow-right">{{ t('routes.all') }}</Button>
                </div>
            </div>

            <nav v-if="siblings.length" class="tm-route-page__others" :aria-label="othersTitle">
                <h2 class="tm-route-page__subtitle">{{ othersTitle }}</h2>
                <ul class="tm-route-page__chips">
                    <li v-for="item in siblings" :key="item.to">
                        <NuxtLink :to="localePath(item.to)" class="tm-route-page__chip">
                            <span>{{ item.label }}</span>
                            <small v-if="item.price">{{ t('routes.priceFrom', { price: item.price }) }}</small>
                        </NuxtLink>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<script setup lang="ts">
import TourCard from '~/shared/components/tourCard/TourCard.vue'
import { useRoutePage } from './Route.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { page, heading, lead, offers, othersTitle, searchLink, cardRoute, siblings, breadcrumbs, isStaff } = await useRoutePage()
</script>

<style lang="scss">
@use './_route.scss';
</style>
