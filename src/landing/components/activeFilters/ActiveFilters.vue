<template>
    <ul v-if="chips.length" class="tm-active-filters" :aria-label="t('filters.active')">
        <li v-for="chip in chips" :key="chip.key">
            <button type="button" class="tm-active-filters__chip" :aria-label="t('filters.removeOne', { name: chip.label })" @click="chip.remove">
                {{ chip.label }}
                <Icon name="close" :size="13" />
            </button>
        </li>
        <li v-if="chips.length > 1">
            <button type="button" class="tm-active-filters__clear" @click="clear">{{ t('filters.clearAll') }}</button>
        </li>
    </ul>
</template>

<script setup lang="ts">
import { EMPTY_FILTERS } from '~/shared/components/filterPanel/FilterPanel.config'
import { mealLabel } from '~/shared/components/filterPanel/FilterPanel.hooks'
import type { SearchFilters } from '~/search_engine/contracts/search'
import { useHotelLabels } from '~/shared/composables/useHotelLabels'
import type { IActiveFiltersProps } from './ActiveFilters.d'

const props = defineProps<IActiveFiltersProps>()

const filters = defineModel<SearchFilters>({ required: true })

const { t, locale } = useI18n()
const { labelOf: hotelLabel } = useHotelLabels()

const without = <K extends keyof SearchFilters>(field: K, value: unknown) => () => {
  const current = filters.value[field] as unknown[]

  filters.value = { ...filters.value, [field]: current.filter(entry => entry !== value) }
}

const money = (value: number) => {
  const currency = props.facets.currency ?? 'USD'

  try {
    return new Intl.NumberFormat(locale.value, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  }
  catch {
    return String(value)
  }
}

const labelOf = (options: Array<{ value: string, label: string }> | undefined, value: string) =>
  options?.find(option => option.value === value)?.label ?? value

const chips = computed(() => {
  const value = filters.value
  const list: Array<{ key: string, label: string, remove: () => void }> = []

  for (const star of [...value.stars].sort()) list.push({ key: `s${star}`, label: `${star}★`, remove: without('stars', star) })

  if (value.priceMin !== undefined || value.priceMax !== undefined) {
    list.push({
      key: 'price',
      label: [value.priceMin !== undefined ? `${t('filters.priceFrom')} ${money(value.priceMin)}` : '', value.priceMax !== undefined ? `${t('filters.priceTo')} ${money(value.priceMax)}` : '']
        .filter(Boolean).join(' '),
      remove: () => { filters.value = { ...filters.value, priceMin: undefined, priceMax: undefined } },
    })
  }

  for (const meal of value.meals) {
    const option = props.facets.meals?.find(entry => entry.value === meal) ?? { value: meal, label: meal }

    list.push({ key: `m${meal}`, label: mealLabel(t, option), remove: without('meals', meal) })
  }

  for (const resort of value.resorts) list.push({ key: `r${resort}`, label: labelOf(props.facets.districts, resort), remove: without('resorts', resort) })
  for (const hotel of value.hotels) list.push({ key: `h${hotel}`, label: hotelLabel(hotel), remove: without('hotels', hotel) })
  for (const supplier of value.suppliers) list.push({ key: `o${supplier}`, label: labelOf(props.facets.suppliers, supplier), remove: without('suppliers', supplier) })

  return list
})

const clear = () => { filters.value = { ...EMPTY_FILTERS, stars: [], meals: [], resorts: [], hotels: [], suppliers: [] } }
</script>

<style lang="scss">
@use './_active-filters.scss';
</style>
