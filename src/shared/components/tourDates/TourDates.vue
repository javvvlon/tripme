<template>
    <div ref="root" class="tm-tour-dates" :class="`tm-tour-dates--${variant}`">
        <button
            :id="id" type="button" class="tm-tour-dates__control"
            :disabled="disabled"
            :aria-expanded="open" :aria-haspopup="true" :aria-controls="`${id}-panel`"
            @click="open = !open"
        >
            <span class="tm-tour-dates__label">{{ label }}</span>

            <span class="tm-tour-dates__value">
                <span v-if="model.date" class="tm-tour-dates__chosen">{{ chosen }}</span>
                <span v-else class="tm-tour-dates__placeholder">{{ placeholder }}</span>

                <Icon
                    v-if="!model.date" name="calendar" :size="17"
                    class="tm-tour-dates__caret"
                />
            </span>
        </button>

        <button
            v-if="model.date"
            type="button" class="tm-tour-dates__clear"
            :aria-label="t('search.clearField', { field: label })"
            @click="clear"
        >
            <Icon name="close" :size="14" :stroke="2.2" />
        </button>

        <div v-if="open" :id="`${id}-panel`" class="tm-tour-dates__panel">
            <h2 class="tm-tour-dates__title">{{ label }}</h2>

            <div class="tm-tour-dates__months">
                <button
                    type="button" class="tm-tour-dates__nav tm-tour-dates__nav--back"
                    :disabled="!canGoBack" :aria-label="t('search.dates.earlier')"
                    @click="shift(-1)"
                >
                    <Icon name="chevron-left" :size="18" />
                </button>

                <section v-for="month in months" :key="month.iso" class="tm-tour-dates__month">
                    <h3 class="tm-tour-dates__month-name">{{ month.label }}</h3>

                    <div class="tm-tour-dates__weekdays" aria-hidden="true">
                        <span v-for="day in weekdays" :key="day">{{ day }}</span>
                    </div>

                    <div class="tm-tour-dates__grid">
                        <span v-for="blank in month.blanks" :key="`b${blank}`" />

                        <button
                            v-for="day in month.days" :key="day.iso"
                            type="button"
                            class="tm-tour-dates__day"
                            :class="{
                                'is-selected': day.iso === model.date,
                                'is-window': inWindow(day.iso),
                            }"
                            :disabled="day.disabled"
                            :aria-pressed="day.iso === model.date"
                            @click="pick(day.iso)"
                        >
                            {{ day.day }}
                        </button>
                    </div>
                </section>

                <button
                    type="button" class="tm-tour-dates__nav tm-tour-dates__nav--on"
                    :disabled="!canGoOn" :aria-label="t('search.dates.later')"
                    @click="shift(1)"
                >
                    <Icon name="chevron-right" :size="18" />
                </button>
            </div>

            <p class="tm-tour-dates__section">{{ t('search.dates.duration') }}</p>

            <div class="tm-tour-dates__nights">
                <button
                    v-for="n in nightsOptions" :key="n"
                    type="button" class="tm-tour-dates__night"
                    :class="{ 'is-on': n === model.nights }"
                    :aria-pressed="n === model.nights"
                    @click="model = { ...model, nights: n }"
                >
                    {{ t('search.nights', n) }}
                </button>
            </div>

            <label class="tm-tour-dates__flex">
                <input type="checkbox" :checked="Boolean(model.flex)" @change="toggleFlex">
                <span>
                    <strong>{{ t('search.dates.flexible', { days: FLEX_DAYS }) }}</strong>
                    <span>{{ t('search.dates.flexibleHint', { days: FLEX_DAYS }) }}</span>
                </span>
            </label>

            <button type="button" class="tm-tour-dates__done" @click="open = false">
                {{ t('search.sheetDone') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import { FLEX_DAYS } from '~/shared/composables/useSearchCriteria'
import { addDays, fromIso } from '~/shared/helpers/dates'
import { useCalendar } from './TourDates.hooks'
import type { ITourDates, ITourDatesProps } from './TourDates.d'

const props = withDefaults(defineProps<ITourDatesProps>(), { variant: 'panel' })

const model = defineModel<ITourDates>({ required: true })

const { t, locale } = useI18n()
const id = useId()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

const { months, weekdays, canGoBack, canGoOn, shift } = useCalendar(
    () => props.calendar,
    () => model.value.date,
)

const chosen = computed(() => {
    if (!model.value.date) return ''

    const day = new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' })
        .format(fromIso(model.value.date))

    return model.value.flex ? `${day} ±${model.value.flex}` : day
})

const inWindow = (iso: string): boolean => {
    if (!model.value.flex || !model.value.date) return false

    return iso > model.value.date && iso <= addDays(model.value.date, model.value.flex)
}

const pick = (iso: string) => {
    model.value = { ...model.value, date: iso }
}

const toggleFlex = (event: Event) => {
    model.value = { ...model.value, flex: (event.target as HTMLInputElement).checked ? FLEX_DAYS : 0 }
}

const clear = () => {
    model.value = { ...model.value, date: '', flex: 0 }
}

const onAway = (event: MouseEvent) => {
    if (!root.value?.contains(event.target as Node)) open.value = false
}

const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') open.value = false
}

watch(open, (next) => {
    if (next) {
        window.addEventListener('mousedown', onAway)
        window.addEventListener('keydown', onKey)
    }
    else {
        window.removeEventListener('mousedown', onAway)
        window.removeEventListener('keydown', onKey)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onAway)
    window.removeEventListener('keydown', onKey)
})
</script>

<style lang="scss">
@use './_tour-dates.scss';
</style>
