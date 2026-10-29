<template>
    <div
        class="tm-search-widget"
        :class="[`tm-search-widget--${variant}`, {
            'tm-search-widget--untabbed': !showTabs,
            'tm-search-widget--stay': product,
            'is-collapsed': variant === 'bar' && !expanded,
        }]"
    >
        <button
            v-if="variant === 'bar'"
            type="button" class="tm-search-widget__summary"
            :aria-expanded="expanded"
            @click="expanded = true"
        >
            <Icon name="search" :size="18" class="tm-search-widget__summary-icon" />
            <span class="tm-search-widget__summary-text">
                <strong>{{ summaryWhere }}</strong>
                <span>{{ summaryWhen }}</span>
            </span>
            <span class="tm-search-widget__summary-edit">{{ t('search.edit') }}</span>
        </button>

        <Tabs
            v-if="showTabs"
            v-model="mode" :items="modeTabs" variant="floating"
            :aria-label="t('search.modeLabel')"
            class="tm-search-widget__tabs"
        />

        <form class="tm-search-widget__panel" @submit.prevent="go">
            <Combobox
                v-if="!product"
                v-model="criteria.from"
                :label="t('search.from')" :placeholder="t('search.fromPlaceholder')"
                :options="departureOptions" :variant="fieldVariant" clearable
                :unavailable="unavailable"
            />
            <Combobox
                ref="toField"
                v-model="criteria.to"
                :label="t('search.to')" :placeholder="t('search.toPlaceholder')"
                :options="countryOptions" :variant="fieldVariant" clearable
                :unavailable="unavailable"
                :pinned="product ? null : showcaseOption" :attention="attention"
                @pinned="openShowcase"
            />
            <TourDates
                v-model="dates"
                :label="t(product ? `search.dates.${product}` : 'search.dates.label')" :placeholder="t('search.datePlaceholder')"
                :calendar="calendar" :nights-options="product === SearchMode.Excursions ? [] : nightsOptions" :variant="fieldVariant"
            />
            <TravellersPicker
                v-model="travellers"
                :label="t('search.who')"
                :max-adults="maxAdults" :variant="fieldVariant"
            />

            <Button
                type="submit" class="tm-search-widget__submit"
                :size="variant === 'hero' ? 'lg' : 'md'"
            >
                {{ t(product ? `search.submitModes.${product}` : 'search.submit') }}
            </Button>
        </form>
    </div>
</template>

<script setup lang="ts">
import TourDates from '~/shared/components/tourDates/TourDates.vue'
import TravellersPicker from '~/shared/components/travellersPicker/TravellersPicker.vue'
import { SearchMode, isProductMode } from '~/search_engine/contracts/search'
import type { ITourDates } from '~/shared/components/tourDates/TourDates.d'
import type { ITravellers } from '~/shared/components/travellersPicker/TravellersPicker.d'
import type { ISearchWidgetProps } from './SearchWidget.d'
import { SEARCH_MODES, SHOWCASE_OPTION } from './SearchWidget.config'
import Combobox from '~/shared/components/combobox/Combobox.vue'
import type { IComboboxOption } from '~/shared/components/combobox/Combobox.d'
import { useDeparture } from '~/shared/composables/useArenaPresets'

const props = withDefaults(defineProps<ISearchWidgetProps>(), { variant: 'hero' })

const { t, locale } = useI18n()

const { criteria, submit, travellersLabel, nightsLabel } = useSearchCriteria()

const route = useRoute()

const expanded = ref(false)

watch(() => route.fullPath, () => { expanded.value = false })

const from = computed(() => criteria.from)
const to = computed(() => criteria.to)
const searchMode = computed(() => props.mode ?? criteria.mode)

const product = computed(() => (isProductMode(searchMode.value) ? searchMode.value : null))

const {
  calendar,
  unavailable,
  countryOptions,
  departureOptions,
  maxAdults,
  nightsOptions,
} = useSearchReferences(from, to, searchMode)

const dates = computed<ITourDates>({
  get: () => ({ date: criteria.date, dateTo: criteria.dateTo, nights: criteria.nights }),
  set: (value) => {
    criteria.date = value.date
    criteria.dateTo = value.dateTo
    criteria.nights = value.nights
  },
})

const travellers = computed<ITravellers>({
  get: () => ({ adults: criteria.adults, kidAges: criteria.kidAges }),
  set: (value) => {
    criteria.adults = value.adults
    criteria.kidAges = value.kidAges
    criteria.kids = value.kidAges.length
  },
})

watch(countryOptions, (options) => {
  if (product.value && criteria.to && options.length && !options.some(option => option.value === criteria.to)) criteria.to = ''
})

const send = () => {
  criteria.mode = searchMode.value

  return submit()
}

watch(nightsOptions, (options) => {
  if (options.length && !options.includes(criteria.nights)) {
    criteria.nights = options.includes(7) ? 7 : options[0]!
  }
})

watch(maxAdults, (max) => {
  if (criteria.adults > max) criteria.adults = max
})

const fieldVariant = computed(() => (props.variant === 'bar' ? 'bar' : 'panel'))

const departure = useDeparture()

watch(() => criteria.from, (value) => {
  if (value) departure.value = value
}, { immediate: true })

const toField = useTemplateRef<InstanceType<typeof Combobox>>('toField')

const attention = ref(false)

watch(() => criteria.to, (value) => {
  if (value) attention.value = false
})

const showcaseOption = computed<IComboboxOption | null>(() => {
  const city = departureOptions.value.find(option => option.value === criteria.from)?.label

  return city ? { value: SHOWCASE_OPTION, label: t('search.showcase.all', { city }), hint: t('search.showcase.hint') } : null
})

const openShowcase = () => {
  attention.value = false
  criteria.to = ''
  expanded.value = false
  void send()
}

const go = () => {
  if (criteria.to) return void send()

  attention.value = true
  if (props.variant === 'bar') expanded.value = true
  nextTick(() => toField.value?.openMenu())
}

const labelOf = (options: Array<{ value: string, label: string }>, value: string) =>
  options.find(option => option.value === value)?.label ?? ''

const summaryWhere = computed(() => {
  const from = labelOf(departureOptions.value, criteria.from)
  const to = labelOf(countryOptions.value, criteria.to)

  if (!to) return t('search.summaryEmpty')

  if (product.value) return t(`search.modeTitle.${product.value}`, { place: to })

  return from ? `${from} → ${to}` : to
})

const summaryWhen = computed(() => {
  const parts: string[] = []

  if (criteria.date) parts.push(formatDayRange(criteria.date, criteria.dateTo, locale.value))

  if (product.value !== SearchMode.Excursions) parts.push(nightsLabel.value)

  parts.push(travellersLabel.value)

  return parts.join(' · ')
})

const modeTabs = computed(() =>
  SEARCH_MODES.map(m => ({ value: m.value, label: t(m.labelKey), icon: m.icon })),
)

const showTabs = computed(() => props.variant === 'hero' && SEARCH_MODES.length > 1)

const mode = computed({
  get: () => criteria.mode as string,
  set: (value: string) => { criteria.mode = value as SearchMode },
})
</script>

<style lang="scss">
@use './_search-widget.scss';
</style>
