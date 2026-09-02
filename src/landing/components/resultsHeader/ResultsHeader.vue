<template>
    <header class="tm-results-header">
        <h1 class="tm-results-header__title">{{ title }}</h1>

        <div v-if="sortable" class="tm-results-header__controls">
            <div class="tm-results-header__sort">
                <label :for="`${id}-sort`" class="sr-only">{{ t('results.sort') }}</label>
                <Icon name="filter" :size="15" />
                <select :id="`${id}-sort`" v-model="sort">
                    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
                <span aria-hidden="true">{{ currentSortLabel }}</span>
                <Icon name="chevron" :size="15" />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { SearchSort } from '~/search_engine/contracts/search'

defineProps<{ title: string, sortable?: boolean }>()

const sort = defineModel<SearchSort>('sort', { default: SearchSort.Popular })

const { t } = useI18n()
const id = useId()

const sortOptions = computed(() => [
  { value: SearchSort.Popular, label: t('results.sortPopular') },
  { value: SearchSort.PriceAsc, label: t('results.sortPriceAsc') },
  { value: SearchSort.PriceDesc, label: t('results.sortPriceDesc') },
  { value: SearchSort.RatingDesc, label: t('results.sortRating') },
])

const currentSortLabel = computed(() =>
  sortOptions.value.find(o => o.value === sort.value)?.label ?? '',
)
</script>

<style lang="scss">
@use './_results-header.scss';
</style>
