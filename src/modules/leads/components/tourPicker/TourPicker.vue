<template>
    <div class="tm-tour-picker">
        <template v-if="selected">
            <div class="tm-tour-picker__chosen">
                <div class="tm-tour-picker__chosen-main">
                    <p class="tm-tour-picker__chosen-name">{{ selected.get('hotelName') }}</p>
                    <p class="tm-tour-picker__chosen-meta">
                        {{ selected.get('supplier').name }} ·
                        {{ formatDateRange(selected.get('checkIn'), selected.get('nights'), locale) }} ·
                        {{ selected.get('adults') }}<template v-if="selected.get('children')">+{{ selected.get('children') }}</template>
                    </p>
                </div>

                <p class="tm-tour-picker__chosen-price">{{ formatMoney(selected.get('price'), locale) }}</p>

                <Button type="button" size="sm" variant="ghost" @click="emit('update:selected', null)">
                    {{ t('cms.leads.picker.change') }}
                </Button>
            </div>
        </template>

        <template v-else>
            <div class="tm-tour-picker__criteria">
                <Combobox
                    v-model="from" variant="field"
                    :label="t('search.from')"
                    :options="references.departureOptions.value"
                    :placeholder="t('search.fromPlaceholder')"
                />

                <Combobox
                    v-model="to" variant="field"
                    :label="t('search.to')"
                    :options="references.countryOptions.value"
                    :placeholder="t('search.toPlaceholder')"
                    :disabled="!from"
                />

                <Input v-model="date" type="date" :label="t('cms.leads.create.checkIn')" />

                <Combobox
                    v-model="nightsValue" variant="field"
                    :label="t('cms.leads.create.nights')"
                    :options="nightsOptions"
                />

                <Combobox
                    v-model="adultsValue" variant="field"
                    :label="t('cms.leads.create.adults')"
                    :options="adultsOptions"
                />

                <Combobox
                    v-model="kidsValue" variant="field"
                    :label="t('cms.leads.create.children')"
                    :options="kidsOptions"
                />
            </div>

            <div class="tm-tour-picker__run">
                <Button type="button" size="sm" :disabled="!canSearch || searching" @click="run">
                    {{ searching ? t('cms.leads.picker.searching') : t('cms.leads.picker.search') }}
                </Button>

                <span v-if="error" class="tm-tour-picker__error">{{ error }}</span>
                <span v-else-if="searched && !results.length" class="tm-tour-picker__note">
                    {{ t('cms.leads.picker.empty') }}
                </span>
                <span v-else-if="results.length" class="tm-tour-picker__note">
                    {{ t('cms.leads.picker.found', { count: results.length }) }}
                </span>
            </div>

            <ul v-if="results.length" class="tm-tour-picker__results">
                <li v-for="tour in results" :key="tour.get('id')">
                    <button type="button" class="tm-tour-picker__option" @click="emit('update:selected', tour)">
                        <span class="tm-tour-picker__option-main">
                            <span class="tm-tour-picker__option-name">{{ tour.get('hotelName') }}</span>
                            <span class="tm-tour-picker__option-meta">
                                {{ tour.get('supplier').name }}
                                <template v-if="tour.get('mealName')"> · {{ tour.get('mealName') }}</template>
                                <template v-if="tour.get('roomName')"> · {{ tour.get('roomName') }}</template>
                            </span>
                        </span>

                        <span class="tm-tour-picker__option-price">{{ formatMoney(tour.get('price'), locale) }}</span>
                    </button>
                </li>
            </ul>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useTourPicker } from './TourPicker.hooks'
import type { Tour } from '~/search_engine/models/Tour'

defineProps<{ selected: Tour | null }>()
const emit = defineEmits<{ 'update:selected': [tour: Tour | null] }>()

const { t, locale } = useI18n()

const {
    from, to, date, nights, adults, kids,
    references, results, searching, searched, error, canSearch, run,
} = useTourPicker()

const numeric = (model: Ref<number>) => computed({
    get: () => String(model.value),
    set: (next: string) => { model.value = Number(next) || 0 },
})

const nightsValue = numeric(nights)
const adultsValue = numeric(adults)
const kidsValue = numeric(kids)

const nightsOptions = computed(() =>
    references.nightsOptions.value.map(value => ({ value: String(value), label: String(value) })))

const adultsOptions = computed(() =>
    Array.from({ length: references.maxAdults.value }, (_, index) => ({
        value: String(index + 1),
        label: String(index + 1),
    })))

const kidsOptions = computed(() =>
    Array.from({ length: 4 }, (_, index) => ({ value: String(index), label: String(index) })))
</script>

<style lang="scss">
@use './_tour-picker.scss';
</style>
