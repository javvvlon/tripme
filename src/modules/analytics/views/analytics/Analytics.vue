<template>
    <div class="tm-analytics">
        <header class="tm-analytics__head">
            <SectionHead
                :level="1"
                :title="t('cms.analytics.title')"
                :sub="data ? t('cms.analytics.period', { from: day(data.period.from), to: day(data.period.to), prevFrom: day(data.period.previous.from), prevTo: day(data.period.previous.to) }) : ''"
            />

            <div class="tm-analytics__presets" role="radiogroup" :aria-label="t('cms.analytics.periodLabel')">
                <button
                    v-for="value in PRESETS" :key="value"
                    type="button" role="radio"
                    class="tm-analytics__preset" :class="{ 'is-on': preset === value }"
                    :aria-checked="preset === value"
                    @click="preset = value"
                >
                    {{ t(`cms.analytics.presets.${value}`) }}
                </button>
            </div>
        </header>

        <EditorSkeleton v-if="pending && !data" variant="rows" />

        <template v-else-if="data">
            <section class="tm-analytics__kpis" :class="{ 'is-loading': pending }">
                <article v-for="tile in tiles" :key="tile.key" class="tm-analytics__tile">
                    <p class="tm-analytics__tile-label">{{ tile.label }}</p>
                    <p class="tm-analytics__tile-value">{{ tile.value }}</p>
                    <p v-if="tile.sub" class="tm-analytics__tile-sub">{{ tile.sub }}</p>
                    <p v-if="tile.delta" class="tm-analytics__delta" :class="`is-${tile.delta.tone}`">
                        {{ tile.delta.text }} <span>{{ t('cms.analytics.vsPrevious') }}</span>
                    </p>
                </article>
            </section>

            <section class="tm-analytics__card">
                <h2 class="tm-analytics__card-title">{{ t(data.period.bucket === 'week' ? 'cms.analytics.trendWeekly' : 'cms.analytics.trendDaily') }}</h2>
                <TrendChart :points="trend" :caption="t('cms.analytics.trendDaily')" />
            </section>

            <div class="tm-analytics__split">
                <section class="tm-analytics__card">
                    <h2 class="tm-analytics__card-title">{{ t('cms.analytics.funnel.title') }}</h2>
                    <BarList :rows="funnel" :empty="t('cms.analytics.empty')" />
                    <p class="tm-analytics__note">{{ t('cms.analytics.funnel.note') }}</p>
                </section>

                <section class="tm-analytics__card">
                    <h2 class="tm-analytics__card-title">{{ t('cms.analytics.attention.title') }}</h2>

                    <p v-if="!attentionTotal" class="tm-analytics__calm">{{ t('cms.analytics.attention.calm') }}</p>

                    <div v-for="block in attention" v-show="block.total" :key="block.key" class="tm-analytics__alert">
                        <p class="tm-analytics__alert-head">
                            <span>{{ block.title }}</span>
                            <strong>{{ block.total }}</strong>
                        </p>
                        <ul class="tm-analytics__alert-list">
                            <li v-for="item in block.items" :key="item.id">
                                <NuxtLink :to="localePath(item.to)" class="tm-analytics__alert-link">
                                    <span class="tm-analytics__ref">{{ item.ref }}</span>
                                    <span class="tm-analytics__alert-text">{{ item.text }}</span>
                                    <span class="tm-analytics__alert-meta">{{ item.meta }}</span>
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>

            <h2 class="tm-analytics__section">{{ t('cms.analytics.mix.title') }}</h2>

            <div class="tm-analytics__grid">
                <section v-for="block in mix" :key="block.key" class="tm-analytics__card">
                    <h3 class="tm-analytics__card-title">{{ block.title }}</h3>
                    <BarList :rows="block.rows" :empty="t('cms.analytics.noSales')" />
                </section>
            </div>

            <div class="tm-analytics__split">
                <section class="tm-analytics__card">
                    <h2 class="tm-analytics__card-title">{{ t('cms.analytics.channels.title') }}</h2>
                    <table v-if="data.mix.channels.length" class="tm-analytics__table">
                        <thead>
                            <tr>
                                <th scope="col">{{ t('cms.analytics.channels.channel') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.channels.leads') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.channels.paid') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.channels.conversion') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in data.mix.channels" :key="row.channel">
                                <td>{{ channelLabel(row.channel) }}</td>
                                <td class="is-num">{{ row.leads }}</td>
                                <td class="is-num">{{ row.paid }}</td>
                                <td class="is-num">{{ percent(row.conversion) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else class="tm-analytics__note">{{ t('cms.analytics.empty') }}</p>
                </section>

                <section class="tm-analytics__card">
                    <h2 class="tm-analytics__card-title">{{ t('cms.analytics.rejections.title') }}</h2>
                    <BarList :rows="rejections" :empty="t('cms.analytics.rejections.none')" />
                </section>
            </div>

            <section class="tm-analytics__card">
                <h2 class="tm-analytics__card-title">{{ t('cms.analytics.managers.title') }}</h2>
                <div class="tm-analytics__scroll">
                    <table v-if="data.managers.length" class="tm-analytics__table">
                        <thead>
                            <tr>
                                <th scope="col">{{ t('cms.analytics.managers.name') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.managers.leads') }}</th>
                                <th v-for="column in STATUS_COLUMNS" :key="column.key" scope="col" class="is-num">
                                    {{ t(`cms.leads.status.${column.status}`) }}
                                </th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.managers.response') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.managers.conversion') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.managers.paid') }}</th>
                                <th scope="col" class="is-num">{{ t('cms.analytics.managers.revenue') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in data.managers" :key="row.id ?? 'none'">
                                <td>{{ row.name || t('cms.analytics.managers.unassigned') }}</td>
                                <td class="is-num">{{ row.leads }}</td>
                                <td
                                    v-for="column in STATUS_COLUMNS" :key="column.key"
                                    class="is-num" :class="{ 'is-muted': !row.statuses[column.key] }"
                                >
                                    {{ row.statuses[column.key] ?? 0 }}
                                </td>
                                <td class="is-num" :class="{ 'is-late': (row.responseMedianMinutes ?? 0) > RESPONSE_SLA_MINUTES }">
                                    {{ row.responseMedianMinutes === null ? '—' : waitLabel(row.responseMedianMinutes, t) }}
                                </td>
                                <td class="is-num">{{ percent(row.conversion) }}</td>
                                <td class="is-num">{{ row.paidOrders }}</td>
                                <td class="is-num">{{ usd(row.revenueUsd) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else class="tm-analytics__note">{{ t('cms.analytics.empty') }}</p>
                </div>
            </section>

            <p class="tm-analytics__note">{{ t('cms.analytics.footnote') }}</p>
        </template>
    </div>
</template>

<script setup lang="ts">
import { STATUS_COLUMNS } from './Analytics.config'
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import BarList from '~/modules/analytics/components/barList/BarList.vue'
import TrendChart from '~/modules/analytics/components/trendChart/TrendChart.vue'
import { RESPONSE_SLA_MINUTES } from '~/modules/leads/contracts/leads'
import { waitLabel } from '~/modules/leads/helpers/compliance'
import { PRESETS, useAnalytics } from './Analytics.hooks'
import type { IBarRow } from '~/modules/analytics/components/barList/BarList.d'
import type { ITrendPoint } from '~/modules/analytics/components/trendChart/TrendChart.d'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { label } = useCatalogLabel()

const { preset, data, pending, delta } = useAnalytics()

const day = (iso: string) =>
    new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))

const usd = (value: number | null) =>
    value === null ? '—' : formatMoney({ amount: value, currency: 'USD' }, locale.value)

const sum = (value: number | null) => {
    const rate = data.value?.usdRate

    if (value === null || !rate) return ''

    return t('price.uzsApprox', {
        amount: new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(Math.round((value * rate) / 1_000_000) * 1_000_000),
    })
}

const percent = (value: number | null) => (value === null ? '—' : `${Math.round(value * 100)}%`)

const channelLabel = (channel: string) => t(`cms.leads.channels.${channel}`)

const tiles = computed(() => {
    const now = data.value?.kpis.current

    if (!now) return []

    return [
        { key: 'leads', label: t('cms.analytics.kpi.leads'), value: String(now.leads), sub: '', delta: delta('leads') },
        { key: 'conversion', label: t('cms.analytics.kpi.conversion'), value: percent(now.conversion), sub: t('cms.analytics.kpi.paidOrders', { n: now.paidOrders }), delta: delta('conversion') },
        { key: 'revenue', label: t('cms.analytics.kpi.revenue'), value: usd(now.revenueUsd), sub: sum(now.revenueUsd), delta: delta('revenueUsd') },
        { key: 'average', label: t('cms.analytics.kpi.average'), value: usd(now.averageOrderUsd), sub: '', delta: delta('averageOrderUsd') },
        {
            key: 'response',
            label: t('cms.analytics.kpi.response'),
            value: now.responseMedianMinutes === null ? '—' : waitLabel(now.responseMedianMinutes, t),
            sub: now.responseWithinSla === null ? '' : t('cms.analytics.kpi.withinSla', { pct: percent(now.responseWithinSla), n: RESPONSE_SLA_MINUTES }),
            delta: delta('responseMedianMinutes', false),
        },
    ]
})

const trend = computed<ITrendPoint[]>(() => (data.value?.trend ?? []).map(point => ({
    key: point.date,
    label: day(point.date),
    value: point.leads,
    tooltip: [
        data.value?.period.bucket === 'week' ? t('cms.analytics.weekOf', { date: day(point.date) }) : day(point.date),
        t('cms.analytics.tip.leads', { n: point.leads }),
        t('cms.analytics.tip.paid', { n: point.paid }),
        t('cms.analytics.tip.revenue', { amount: usd(point.revenueUsd) }),
    ],
})))

const funnel = computed<IBarRow[]>(() => {
    const steps = data.value?.funnel ?? []
    const first = steps[0]?.count ?? 0

    return steps.map((step, index) => {
        const before = index ? steps[index - 1]!.count : step.count

        return {
            key: step.key,
            label: t(`cms.analytics.funnel.${step.key}`),
            value: step.count,
            display: index ? `${step.count} · ${percent(first ? step.count / first : null)}` : String(step.count),
            hint: index ? t('cms.analytics.funnel.fromPrevious', { pct: percent(before ? step.count / before : null) }) : undefined,
        }
    })
})

const mixRows = (rows: Array<{ key: string, orders: number, revenueUsd: number }>, name: (key: string) => string): IBarRow[] => {
    const merged = new Map<string, { label: string, orders: number, revenueUsd: number }>()

    for (const row of rows) {
        const label = name(row.key)
        const id = label.toLocaleLowerCase(locale.value)
        const group = merged.get(id) ?? { label, orders: 0, revenueUsd: 0 }

        group.orders += row.orders
        group.revenueUsd += row.revenueUsd
        merged.set(id, group)
    }

    return [...merged.entries()]
        .sort(([, a], [, b]) => b.revenueUsd - a.revenueUsd || b.orders - a.orders)
        .map(([id, row]) => ({
            key: id,
            label: row.label,
            value: row.revenueUsd || row.orders,
            display: usd(row.revenueUsd),
            hint: t('cms.analytics.tip.orders', { n: row.orders }),
        }))
}

const mix = computed(() => {
    const m = data.value?.mix

    if (!m) return []

    return [
        { key: 'destinations', title: t('cms.analytics.mix.destinations'), rows: mixRows(m.destinations, key => (key ? label(key) || key : t('cms.analytics.unknown'))) },
        { key: 'operators', title: t('cms.analytics.mix.operators'), rows: mixRows(m.operators, key => key || t('cms.analytics.unknown')) },
        { key: 'stars', title: t('cms.analytics.mix.stars'), rows: mixRows(m.stars, key => (key ? `${key}★` : t('cms.analytics.noCategory'))) },
        { key: 'hotels', title: t('cms.analytics.mix.hotels'), rows: mixRows(m.hotels, key => key || t('cms.analytics.unknown')) },
    ]
})

const rejections = computed<IBarRow[]>(() => (data.value?.rejections ?? []).map(row => ({
    key: row.reason || 'none',
    label: row.reason || t('cms.analytics.rejections.noReason'),
    value: row.count,
    display: String(row.count),
})))

const problemText = (problems: string[]) => problems.map(problem => t(`cms.analytics.problems.${problem}`)).join(', ')

const attention = computed(() => {
    const a = data.value?.attention

    if (!a) return []

    return [
        {
            key: 'unanswered',
            title: t('cms.analytics.attention.unanswered', { n: RESPONSE_SLA_MINUTES }),
            total: a.unanswered.total,
            items: a.unanswered.items.map(item => ({ id: item.id, ref: item.ref, to: `/app/leads/${item.id}`, text: item.name, meta: waitLabel(item.minutes, t) })),
        },
        {
            key: 'departures',
            title: t('cms.analytics.attention.departures'),
            total: a.departures.total,
            items: a.departures.items.map(item => ({ id: item.id, ref: item.ref, to: `/app/orders/${item.id}`, text: `${day(item.checkIn)} · ${item.hotel || item.traveller}`, meta: problemText(item.problems) })),
        },
        {
            key: 'stuck',
            title: t('cms.analytics.attention.stuck'),
            total: a.stuckRequests.total,
            items: a.stuckRequests.items.map(item => ({ id: item.id, ref: item.ref, to: `/app/orders/${item.id}`, text: item.hotel, meta: t('cms.analytics.hours', { n: item.hours }) })),
        },
        {
            key: 'cancellations',
            title: t('cms.analytics.attention.cancellations'),
            total: a.cancellations.total,
            items: a.cancellations.items.map(item => ({ id: item.id, ref: item.ref, to: `/app/orders/${item.id}`, text: item.hotel, meta: item.reason })),
        },
    ]
})

const attentionTotal = computed(() =>
    attention.value.filter(block => block.key !== 'cancellations').reduce((sum, block) => sum + block.total, 0))

useSeoMeta({ title: () => t('cms.analytics.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_analytics.scss';
</style>
