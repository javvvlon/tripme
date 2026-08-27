<template>
    <div
        class="tm-search-widget"
        :class="[`tm-search-widget--${variant}`, { 'tm-search-widget--untabbed': !showTabs }]"
    >
        <Tabs
            v-if="showTabs"
            v-model="mode" :items="modeTabs" variant="card"
            :aria-label="t('search.modeLabel')"
        />

        <form class="tm-search-widget__panel" @submit.prevent="submit">
            <Combobox
                v-model="criteria.from"
                :label="t('search.from')" :placeholder="t('search.fromPlaceholder')"
                :options="departureOptions" :variant="fieldVariant" clearable
                :unavailable="unavailable"
            />
            <Combobox
                v-model="criteria.to"
                :label="t('search.to')" :placeholder="t('search.toPlaceholder')"
                :options="countryOptions" :variant="fieldVariant" clearable
                :unavailable="unavailable"
            />
            <DatePicker
                v-model="criteria.date"
                :label="t('search.date')" :placeholder="t('search.datePlaceholder')"
                :calendar="calendar" :variant="fieldVariant"
            />

            <div class="tm-search-widget__select">
                <label :for="`${id}-nights`">{{ t('search.duration') }}</label>
                <div class="tm-search-widget__value">
                    <select :id="`${id}-nights`" v-model.number="criteria.nights">
                        <option v-for="n in nightsOptions" :key="n" :value="n">{{ t('search.nights', n) }}</option>
                    </select>
                    <span>{{ nightsLabel }}</span>
                    <Icon name="chevron" :size="16" class="tm-search-widget__chevron" />
                </div>
            </div>

            <div class="tm-search-widget__select">
                <label :for="`${id}-adults`">{{ t('search.who') }}</label>
                <div class="tm-search-widget__value">
                    <select :id="`${id}-adults`" v-model.number="criteria.adults">
                        <option v-for="n in maxAdults" :key="n" :value="n">{{ t('search.adults', n) }}</option>
                    </select>
                    <span>{{ travellersLabel }}</span>
                    <Icon name="chevron" :size="16" class="tm-search-widget__chevron" />
                </div>
            </div>

            <Button
                type="submit" class="tm-search-widget__submit"
                :size="variant === 'hero' ? 'lg' : 'md'"
            >
                {{ t('search.submit') }}
            </Button>
        </form>
    </div>
</template>

<script setup lang="ts">
import type { SearchMode } from '~/search_engine/contracts/search'
import type { ISearchWidgetProps } from './SearchWidget.d'
import { SEARCH_MODES } from './SearchWidget.config'

const props = withDefaults(defineProps<ISearchWidgetProps>(), { variant: 'hero' })

const { t } = useI18n()
const id = useId()

const { criteria, submit, travellersLabel, nightsLabel } = useSearchCriteria()

const from = computed(() => criteria.from)
const to = computed(() => criteria.to)

const {
  calendar,
  unavailable,
  countryOptions,
  departureOptions,
  maxAdults,
  nightsOptions,
} = useSearchReferences(from, to)

watch(nightsOptions, (options) => {
  if (options.length && !options.includes(criteria.nights)) {
    criteria.nights = options.includes(7) ? 7 : options[0]!
  }
})

watch(maxAdults, (max) => {
  if (criteria.adults > max) criteria.adults = max
})

const fieldVariant = computed(() => (props.variant === 'bar' ? 'bar' : 'panel'))

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
