<template>
    <section class="tm-showcase" :aria-busy="streaming">
        <header class="tm-showcase__head">
            <p class="tm-showcase__summary">{{ summary }}</p>
            <p v-if="streaming" class="tm-showcase__progress" role="status">
                <Spinner :size="14" />{{ t('showcase.searching', { count: countries.length }, countries.length) }}
            </p>
        </header>

        <ul v-if="views.length || skeletons" class="tm-showcase__grid">
            <li v-for="card in views" :key="card.country.slug">
                <NuxtLink :to="card.link" class="tm-showcase__card" @click="open(card)">
                    <span class="tm-showcase__country">{{ card.country.label }}</span>
                    <span v-if="card.saving" class="tm-showcase__saving">{{ card.saving }}</span>

                    <span class="tm-showcase__hotel">
                        {{ card.tour.displayName() }}
                        <span v-if="card.tour.stars()" class="tm-showcase__stars" :aria-label="`${card.tour.stars()}★`">{{ '★'.repeat(card.tour.stars()) }}</span>
                    </span>
                    <span class="tm-showcase__when">{{ card.when }}</span>

                    <span class="tm-showcase__foot">
                        <span class="tm-showcase__price">
                            <small>{{ t('showcase.from') }}</small> {{ card.price }}
                        </span>
                        <span v-if="card.priceUzs" class="tm-showcase__uzs">{{ card.priceUzs }}</span>
                        <span class="tm-showcase__count">{{ t('showcase.offers', { count: card.offers }, card.offers) }}</span>
                    </span>
                </NuxtLink>
            </li>
            <li v-for="index in skeletons" :key="`skeleton-${index}`" class="tm-showcase__ghost" aria-hidden="true">
                <Skeleton width="45%" height="18px" />
                <Skeleton :lines="2" />
                <Skeleton width="35%" height="24px" />
            </li>
        </ul>

        <div v-else-if="failed" class="tm-showcase__status" role="alert">
            <p>{{ t('results.failed') }}</p>
            <Button variant="ghost" size="sm" icon="search" @click="run">{{ t('results.retry') }}</Button>
        </div>

        <p v-else-if="!streaming" class="tm-showcase__status">{{ t('showcase.empty') }}</p>
    </section>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import Skeleton from '~/shared/components/skeleton/Skeleton.vue'
import Spinner from '~/shared/components/spinner/Spinner.vue'
import { useShowcase } from './Showcase.hooks'

const { t } = useI18n()

const { title, summary, views, countries, streaming, failed, skeletons, run, open } = useShowcase()

defineExpose({ title })
</script>

<style lang="scss">
@use './_showcase.scss';
</style>
