<template>
    <section class="tm-day-prices" :aria-label="t('results.daysTitle')">
        <p class="tm-day-prices__title">{{ t('results.daysTitle') }}</p>

        <div class="tm-day-prices__track" role="radiogroup">
            <button
                type="button" role="radio"
                class="tm-day-prices__cell tm-day-prices__cell--all"
                :class="{ 'is-on': !selected }"
                :aria-checked="!selected"
                @click="selected = ''"
            >
                <span class="tm-day-prices__weekday">{{ t('results.daysAll') }}</span>
                <span class="tm-day-prices__date">{{ rangeLabel }}</span>
                <span class="tm-day-prices__price">{{ cheapestLabel }}</span>
            </button>

            <button
                v-for="cell in cells" :key="cell.iso"
                type="button" role="radio"
                class="tm-day-prices__cell"
                :class="{ 'is-on': selected === cell.iso, 'is-cheapest': cell.cheapest, 'is-empty': cell.empty }"
                :aria-checked="selected === cell.iso"
                :disabled="cell.empty"
                @click="selected = selected === cell.iso ? '' : cell.iso"
            >
                <span class="tm-day-prices__weekday">{{ cell.weekday }}</span>
                <span class="tm-day-prices__date">{{ cell.label }}</span>
                <Skeleton v-if="!cell.price && !cell.empty" width="64px" height="14px" />
                <span v-else class="tm-day-prices__price">{{ cell.empty ? t('results.dayEmpty') : cell.price }}</span>
                <span v-if="cell.cheapest" class="tm-day-prices__tag">{{ t('results.daysCheapest') }}</span>
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { addDays, fromIso } from '~/shared/helpers/dates'
import type { IDayCell, IDayPricesProps } from './DayPrices.d'

const props = defineProps<IDayPricesProps>()

const selected = defineModel<string>({ default: '' })

const { t, locale } = useI18n()

const money = (price: { amount: number, currency: string }) =>
    formatMoney({ amount: price.amount, currency: price.currency as 'USD' }, locale.value)

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase(locale.value) + text.slice(1)

const byDate = computed(() => new Map(props.days.map(day => [day.date, day])))

const cheapest = computed(() => {
    const inRange = props.days.filter(day => day.date >= props.from && day.date <= props.to)

    return inRange.reduce<IDayPricesProps['days'][number] | null>(
        (best, day) => (!best || day.price.amount < best.price.amount ? day : best), null)
})

const cells = computed<IDayCell[]>(() => {
    const weekday = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
    const label = new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' })
    const list: IDayCell[] = []

    for (let iso = props.from; iso <= props.to; iso = addDays(iso, 1)) {
        const day = byDate.value.get(iso)

        list.push({
            iso,
            weekday: capitalize(weekday.format(fromIso(iso))),
            label: label.format(fromIso(iso)),
            price: day ? t('results.priceFrom', { price: money(day.price) }) : '',
            cheapest: Boolean(day && cheapest.value?.date === iso && props.days.length > 1),
            empty: !day && !props.loading,
        })
    }

    return list
})

const rangeLabel = computed(() => formatDayRange(props.from, props.to, locale.value))

const cheapestLabel = computed(() =>
    cheapest.value ? t('results.priceFrom', { price: money(cheapest.value.price) }) : '')
</script>

<style lang="scss">
@use './_day-prices.scss';
</style>
