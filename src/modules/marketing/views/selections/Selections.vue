<template>
    <div class="tm-cms-ads">
        <div class="tm-cms-ads__head">
            <SectionHead :level="1" :title="t('cms.marketing.title')" :sub="t('cms.marketing.lead', counts)" />
            <div class="tm-cms-ads__head-actions">
                <Button variant="secondary" icon="pencil" size="sm" @click="openSettings">{{ t('cms.marketing.settings.voice') }}</Button>
                <Button :to="localePath('/search')" icon="search" size="sm">{{ t('cms.marketing.pickTours') }}</Button>
            </div>
        </div>

        <div class="tm-cms-ads__actions">
            <SearchField
                v-model="query"
                :label="t('cms.marketing.search')" :placeholder="t('cms.marketing.searchPlaceholder')"
                icon="search" clearable class="tm-cms-ads__search"
            />
            <Tabs v-model="scope" :items="tabs" variant="segment" :aria-label="t('cms.marketing.title')" />
        </div>

        <EditorSkeleton v-if="status === 'pending' && !rows.length" variant="rows" />

        <p v-else-if="!rows.length" class="tm-cms-ads__empty">
            {{ query ? t('cms.marketing.noMatches') : t('cms.marketing.empty') }}
        </p>

        <div v-else class="tm-cms-ads__scroll">
            <table class="tm-cms-ads__table">
                <thead>
                    <tr>
                        <th scope="col">{{ t('cms.marketing.columns.title') }}</th>
                        <th scope="col" class="is-tours">{{ t('cms.marketing.columns.tours') }}</th>
                        <th scope="col" class="is-num is-money">{{ t('cms.marketing.columns.from') }}</th>
                        <th scope="col" class="is-dates">{{ t('cms.marketing.columns.dates') }}</th>
                        <th scope="col" class="is-num is-leads">{{ t('cms.marketing.columns.leads') }}</th>
                        <th scope="col" class="is-author">{{ t('cms.marketing.columns.author') }}</th>
                        <th scope="col" class="is-date">{{ t('cms.marketing.columns.created') }}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in rows" :key="row.id" class="tm-cms-ads__row" @click="open(row.id)">
                        <td>
                            <NuxtLink :to="localePath(`/app/marketing/${row.id}`)" class="tm-cms-ads__title" @click.stop>
                                <span class="tm-cms-ads__thumb" :style="row.background_url ? { backgroundImage: `url(${row.background_url})` } : undefined">
                                    <Icon v-if="!row.background_url" name="megaphone" :size="14" />
                                </span>
                                <span class="tm-cms-ads__name">
                                    <strong>{{ row.title }}</strong>
                                    <span class="is-muted">{{ row.code }}</span>
                                </span>
                            </NuxtLink>
                        </td>
                        <td :class="{ 'is-warn': row.live < row.tours }">{{ t('cms.marketing.toursCount', { live: row.live, n: row.tours }) }}</td>
                        <td class="is-num">{{ row.from ? money(row.from) : '—' }}</td>
                        <td class="is-muted">{{ row.dates ? days(row.dates.first, row.dates.last) : '—' }}</td>
                        <td class="is-num">
                            <span :class="{ 'tm-cms-ads__leads': row.leads }">{{ row.leads }}</span>
                        </td>
                        <td class="tm-cms-ads__truncate">{{ row.author || '—' }}</td>
                        <td class="is-muted">{{ when(row.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Pagination
            :page="page" :pages="pages" :total="total" :per-page="perPage"
            @update:page="setPage" @update:per-page="setPerPage"
        />

        <MarketingSettings v-model="settingsOpen" :settings="settings" @saved="settings = $event" />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import Pagination from '~/shared/components/pagination/Pagination.vue'
import Tabs from '~/shared/components/tabs/Tabs.vue'
import MarketingSettings from '~/modules/marketing/components/marketingSettings/MarketingSettings.vue'
import { useMarketingRepository } from '~/modules/marketing/repositories'
import type { IMarketingSettings } from '~/modules/marketing/contracts/marketing'
import { useSelections } from './Selections.hooks'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { rows, status, query, scope, tabs, counts, page, pages, total, perPage, setPage, setPerPage } = useSelections()

const money = (value: { amount: number, currency: string }) => formatMoney({ amount: value.amount, currency: value.currency as 'USD' }, locale.value)

const days = (first: string, last: string) => formatDayRange(first, last, locale.value)

const when = (value: string) => new Intl.DateTimeFormat(locale.value, {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(value))

const open = (id: string) => navigateTo(localePath(`/app/marketing/${id}`))

const { settings: loadSettings } = useMarketingRepository()

const settings = ref<IMarketingSettings | null>(null)
const settingsOpen = ref(false)

async function openSettings() {
    settings.value ??= await loadSettings().catch(() => null)
    settingsOpen.value = Boolean(settings.value)
}

useSeoMeta({ title: () => t('cms.marketing.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_selections.scss';
</style>
