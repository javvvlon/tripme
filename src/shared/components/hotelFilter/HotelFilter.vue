<template>
    <div ref="root" class="tm-hotel-filter">
        <ul v-if="selected.length" class="tm-hotel-filter__chosen">
            <li v-for="key in selected" :key="key">
                <button type="button" class="tm-hotel-filter__option is-on" @click="emit('toggle', key)">
                    <span class="tm-hotel-filter__box" aria-hidden="true"><Icon name="check" :size="12" :stroke="2.6" /></span>
                    <span class="tm-hotel-filter__name">{{ labelOf(key) }}</span>
                </button>
            </li>
        </ul>

        <div class="tm-hotel-filter__field">
            <Icon name="search" :size="16" />
            <input
                :id="id"
                v-model="query"
                type="search"
                role="combobox"
                autocomplete="off"
                :placeholder="t('filters.hotelSearch')"
                :aria-label="t('filters.hotelSearch')"
                :aria-expanded="showMenu"
                :aria-controls="`${id}-list`"
                :aria-activedescendant="showMenu && results.length ? `${id}-${active}` : undefined"
                @focus="focus"
                @keydown="onKey"
            >
            <Spinner v-if="loading" :size="14" />
        </div>

        <ul v-if="showMenu" :id="`${id}-list`" class="tm-hotel-filter__menu" role="listbox">
            <li
                v-for="(hotel, index) in results" :id="`${id}-${index}`" :key="hotel.key"
                role="option" class="tm-hotel-filter__item"
                :class="{ 'is-active': index === active, 'is-on': selected.includes(hotel.key) }"
                :aria-selected="selected.includes(hotel.key)"
                @mousedown.prevent="pick(hotel)"
                @mouseenter="active = index"
            >
                <span class="tm-hotel-filter__item-name">{{ hotel.name }}</span>
                <span v-if="hotel.stars" class="tm-hotel-filter__stars" :aria-label="`${hotel.stars}★`">{{ hotel.stars }}★</span>
                <Icon v-if="selected.includes(hotel.key)" name="check" :size="14" class="tm-hotel-filter__tick" />
            </li>

            <li v-if="!loading && !results.length" class="tm-hotel-filter__none">{{ t('filters.hotelNothing') }}</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import Spinner from '~/shared/components/spinner/Spinner.vue'
import type { IHotelFilterEmits, IHotelFilterProps } from './HotelFilter.d'
import { useHotelFilter } from './HotelFilter.hooks'

const props = defineProps<IHotelFilterProps>()
const emit = defineEmits<IHotelFilterEmits>()

const { t } = useI18n()
const id = useId()

const { query, open, loading, results, active, ready, labelOf, focus, pick, onKey } =
    useHotelFilter(props, (event, key) => emit(event, key))

const showMenu = computed(() => open.value && ready.value && (loading.value ? results.value.length > 0 : true))

const root = useTemplateRef<HTMLElement>('root')

const onAway = (event: MouseEvent) => {
    if (!root.value?.contains(event.target as Node)) open.value = false
}

onMounted(() => window.addEventListener('mousedown', onAway))

onBeforeUnmount(() => window.removeEventListener('mousedown', onAway))
</script>

<style lang="scss">
@use './_hotel-filter.scss';
</style>
