<template>
    <aside class="tm-filter-panel" :aria-label="t('filters.title')">
        <header class="tm-filter-panel__head">
            <h2 class="tm-filter-panel__title">{{ t('filters.title') }}</h2>
            <button v-if="activeCount" type="button" class="tm-filter-panel__reset" @click="reset">
                {{ t('filters.resetShort', { count: activeCount }) }}
            </button>
        </header>

        <div v-if="loading" class="tm-filter-panel__loading">
            <div v-for="group in 3" :key="group" class="tm-filter-panel__skeleton">
                <Skeleton width="45%" height="14px" />
                <Skeleton :lines="3" height="12px" />
            </div>
        </div>

        <template v-else>
            <template v-for="group in groups" :key="group.key">
                <Accordion v-if="group.key === 'stars'" :title="t(group.titleKey)" :count="filters.stars.length" class="tm-filter-panel__group">
                    <div class="tm-filter-panel__stars" role="group" :aria-label="t(group.titleKey)">
                        <button
                            v-for="option in stars" :key="option.value"
                            type="button" class="tm-filter-panel__star"
                            :class="{ 'is-on': filters.stars.includes(option.value) }"
                            :aria-pressed="filters.stars.includes(option.value)"
                            @click="toggleStar(option.value)"
                        >
                            <span>{{ option.value }}<span class="tm-filter-panel__star-glyph" aria-hidden="true">★</span></span>
                            <small>{{ option.count }}</small>
                        </button>
                    </div>
                </Accordion>

                <Accordion
                    v-else-if="group.key === 'price'"
                    :title="t(group.titleKey)"
                    :count="filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0"
                    class="tm-filter-panel__group"
                >
                    <PriceRange
                        v-model:from="priceMin" v-model:to="priceMax"
                        :buckets="facets.priceBuckets"
                        :min="facets.priceMin ?? 0" :max="facets.priceMax ?? 0"
                        :currency="facets.currency ?? undefined"
                        :from-label="t('filters.priceFrom')" :to-label="t('filters.priceTo')"
                    />
                </Accordion>

                <Accordion v-else-if="group.key === 'meals'" :title="t(group.titleKey)" :count="filters.meals.length" class="tm-filter-panel__group">
                    <FilterList :options="meals" :selected="filters.meals" :limit="7" @toggle="toggle('meals', $event)" />
                </Accordion>

                <Accordion v-else-if="group.key === 'districts'" :title="t(group.titleKey)" :count="filters.resorts.length" class="tm-filter-panel__group">
                    <FilterList
                        :options="districts" :selected="filters.resorts"
                        :search-label="t('filters.districtSearch')"
                        @toggle="toggle('resorts', $event)"
                    />
                </Accordion>

                <Accordion v-else-if="group.key === 'hotels'" :title="t(group.titleKey)" :count="filters.hotels.length" class="tm-filter-panel__group">
                    <HotelFilter :from="from ?? ''" :to="to ?? ''" :selected="filters.hotels" @toggle="toggle('hotels', $event)" />
                </Accordion>

                <Accordion v-else-if="group.key === 'suppliers'" :title="t(group.titleKey)" :count="filters.suppliers.length" class="tm-filter-panel__group">
                    <FilterList :options="suppliers" :selected="filters.suppliers" :limit="8" @toggle="toggle('suppliers', $event)" />
                    <p class="tm-filter-panel__note">{{ t('filters.suppliersNote') }}</p>
                </Accordion>
            </template>
        </template>
    </aside>
</template>

<script setup lang="ts">
import FilterList from '~/shared/components/filterList/FilterList.vue'
import PriceRange from '~/shared/components/priceRange/PriceRange.vue'
import HotelFilter from '~/shared/components/hotelFilter/HotelFilter.vue'
import type { SearchFilters } from '~/search_engine/contracts/search'
import type { IFilterPanelProps } from './FilterPanel.d'
import { useFilterPanel } from './FilterPanel.hooks'

const props = defineProps<IFilterPanelProps>()

const filters = defineModel<SearchFilters>({ required: true })

const { t } = useI18n()

const {
    groups, stars, meals, districts, suppliers, priceMin, priceMax, activeCount,
    toggle, toggleStar, reset,
} = useFilterPanel(props, filters)
</script>

<style lang="scss">
@use './_filter-panel.scss';
</style>
