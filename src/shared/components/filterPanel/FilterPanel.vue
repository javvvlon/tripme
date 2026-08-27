<template>
    <aside class="tm-filter-panel" :aria-label="t('filters.title')">
        <div v-if="loading" class="tm-filter-panel__card tm-filter-panel__card--loading">
            <div v-for="group in 3" :key="group" class="tm-filter-panel__skeleton-group">
                <Skeleton width="45%" height="15px" />
                <Skeleton :lines="4" height="13px" />
            </div>
        </div>

        <div v-else class="tm-filter-panel__card">
            <template v-for="group in visibleGroups" :key="group.key">
                <Accordion
                    v-if="group.key === 'stars'"
                    :title="t(group.titleKey)" :count="filters.stars.length"
                >
                    <Checkbox
                        v-for="option in facets.stars" :key="option.value"
                        :model-value="filters.stars.includes(Number(option.value))"
                        :label="option.label"
                        @update:model-value="toggleStar(Number(option.value))"
                    />
                </Accordion>

                <Accordion v-else-if="group.key === 'price'" :title="t(group.titleKey)">
                    <PriceRange
                        v-model:from="priceMin"
                        v-model:to="priceMax"
                        :buckets="facets.priceBuckets"
                        :min="facets.priceMin ?? 0" :max="facets.priceMax ?? 0"
                        :from-label="t('filters.priceFrom')" :to-label="t('filters.priceTo')"
                    />
                </Accordion>

                <Accordion
                    v-else
                    :title="t(group.titleKey)" :count="listFilter(group.key).length"
                >
                    <Checkbox
                        v-for="option in facetsFor(group.key)" :key="option.value"
                        :model-value="listFilter(group.key).includes(option.value)"
                        :label="option.label"
                        @update:model-value="toggleListValue(group.key, option.value)"
                    />

                    <p v-if="group.key === 'suppliers'" class="tm-filter-panel__note">
                        {{ t('filters.suppliersNote') }}
                    </p>
                </Accordion>
            </template>
        </div>

        <Button
            v-if="activeCount"
            variant="ghost" block class="tm-filter-panel__reset"
            @click="reset"
        >
            {{ t('filters.reset', { count: activeCount }) }}
        </Button>
    </aside>
</template>

<script setup lang="ts">
import type { FacetOption, SearchFilters } from '~/search_engine/contracts/search'
import type { IFilterPanelProps } from './FilterPanel.d'
import { FILTER_GROUPS } from './FilterPanel.config'
import type { FilterGroupKey } from './FilterPanel.config'

const props = defineProps<IFilterPanelProps>()

const filters = defineModel<SearchFilters>({ required: true })

const { t } = useI18n()

const visibleGroups = computed(() => {
  const chosen = props.groups
    ? FILTER_GROUPS.filter(g => props.groups!.includes(g.key))
    : FILTER_GROUPS

  return chosen.filter((group) => {
    if ('agentOnly' in group && group.agentOnly && !props.agentView) return false

    if (group.key === 'suppliers') return props.facets.suppliers?.length > 1

    return true
  })
})

const LIST_GROUPS = {
  meals: 'meals',
  districts: 'resorts',
  suppliers: 'suppliers',
} as const

function facetsFor(key: FilterGroupKey): FacetOption[] {
  return (props.facets[key as keyof typeof props.facets] as FacetOption[]) ?? []
}

function listFilter(key: FilterGroupKey): string[] {
  const field = LIST_GROUPS[key as keyof typeof LIST_GROUPS]
  return field ? filters.value[field] : []
}

function patch(change: Partial<SearchFilters>) {
  filters.value = { ...filters.value, ...change }
}

function toggleListValue(key: FilterGroupKey, value: string) {
  const field = LIST_GROUPS[key as keyof typeof LIST_GROUPS]
  if (!field) return

  const current = filters.value[field]
  patch({
    [field]: current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value],
  })
}

function toggleStar(value: number) {
  const { stars } = filters.value
  patch({ stars: stars.includes(value) ? stars.filter(v => v !== value) : [...stars, value] })
}

const PRICE_DEBOUNCE_MS = 500

const localPriceMin = ref(filters.value.priceMin)
const localPriceMax = ref(filters.value.priceMax)

watch(filters, (value) => {
  localPriceMin.value = value.priceMin
  localPriceMax.value = value.priceMax
})

const commitPrice = debounce((min: number | undefined, max: number | undefined) => {
  patch({ priceMin: min, priceMax: max })
}, PRICE_DEBOUNCE_MS)

onBeforeUnmount(() => commitPrice.cancel())

const priceMin = computed({
  get: () => localPriceMin.value,
  set: (value) => {
    localPriceMin.value = value
    commitPrice(value, localPriceMax.value)
  },
})

const priceMax = computed({
  get: () => localPriceMax.value,
  set: (value) => {
    localPriceMax.value = value
    commitPrice(localPriceMin.value, value)
  },
})

const activeCount = computed(() => {
  const f = filters.value
  return f.stars.length
    + f.meals.length
    + f.resorts.length
    + f.hotels.length
    + f.suppliers.length
    + (f.priceMin !== undefined ? 1 : 0)
    + (f.priceMax !== undefined ? 1 : 0)
})

function reset() {
  filters.value = {
    stars: [],
    meals: [],
    resorts: [],
    hotels: [],
    suppliers: [],
    priceMin: undefined,
    priceMax: undefined,
  }
}
</script>

<style lang="scss">
@use './_filter-panel.scss';
</style>
