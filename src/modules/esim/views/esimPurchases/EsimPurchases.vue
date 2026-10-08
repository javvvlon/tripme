<template>
    <div class="tm-cms-esim">
        <SectionHead :level="1" :title="t('cms.esim.title')" :sub="t('cms.esim.lead', counts)" />

        <div class="tm-cms-esim__actions">
            <SearchField
                v-model="query"
                :label="t('cms.esim.search')" :placeholder="t('cms.esim.searchPlaceholder')"
                icon="search" clearable class="tm-cms-esim__search"
            />
            <SelectMenu v-model="filter" :options="filterOptions" align="right" />
        </div>

        <EditorSkeleton v-if="status === 'pending' && !rows.length" variant="rows" />

        <p v-else-if="!rows.length" class="tm-cms-esim__empty">
            {{ query || filter ? t('cms.esim.noMatches') : t('cms.esim.empty') }}
        </p>

        <div v-else class="tm-cms-esim__scroll">
            <table class="tm-cms-esim__table">
                <thead>
                    <tr>
                        <th scope="col" class="is-no">{{ t('cms.esim.columns.number') }}</th>
                        <th scope="col" class="is-date">{{ t('cms.esim.columns.date') }}</th>
                        <th scope="col">{{ t('cms.esim.columns.tariff') }}</th>
                        <th scope="col" class="is-num is-money">{{ t('cms.esim.columns.price') }}</th>
                        <th scope="col" class="is-num is-money">{{ t('cms.esim.columns.margin') }}</th>
                        <th scope="col" class="is-method">{{ t('cms.esim.columns.method') }}</th>
                        <th scope="col" class="is-client">{{ t('cms.esim.columns.client') }}</th>
                        <th scope="col" class="is-status">{{ t('cms.esim.columns.status') }}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in rows" :key="row.id">
                        <td class="tm-cms-esim__no">ESIM-{{ row.number }}</td>
                        <td class="is-muted">{{ when(row.created_at) }}</td>
                        <td class="tm-cms-esim__truncate">
                            <span class="tm-cms-esim__flag">{{ flagOf(row.country) }}</span>
                            {{ countryName(row.country, locale) }} · {{ tariff(row.plan_title) }}
                        </td>
                        <td class="is-num">{{ sum(row.price_uzs) }}</td>
                        <td class="is-num is-muted">{{ sum(row.margin_uzs) }}</td>
                        <td>{{ t(`esim.methods.${row.method}`) }}</td>
                        <td class="tm-cms-esim__truncate">
                            <span class="tm-cms-esim__email">{{ row.email }}</span>
                            <span class="is-muted">{{ row.phone }}</span>
                        </td>
                        <td>
                            <span class="tm-cms-esim__status" :class="`is-${row.status}`" :title="row.issue_error || undefined">
                                {{ t(`cms.esim.status.${row.status}`) }}
                            </span>
                            <button
                                v-if="row.status === 'issue_failed'"
                                type="button" class="tm-cms-esim__retry"
                                :disabled="retrying === row.id"
                                @click="issueAgain(row)"
                            >
                                {{ t('cms.esim.retry') }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Pagination
            :page="page" :pages="pages" :total="total" :per-page="perPage"
            @update:page="setPage" @update:per-page="setPerPage"
        />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import Pagination from '~/shared/components/pagination/Pagination.vue'
import { countryName, flagOf, sumOf } from '~/modules/esim/helpers/esim'
import { useEsimPurchases } from './EsimPurchases.hooks'

const { t, locale } = useI18n()

const {
    rows, status, query, filter, filterOptions, counts, retrying, issueAgain,
    page, pages, total, perPage, setPage, setPerPage,
} = useEsimPurchases()

const sum = (value: number) => sumOf(value, locale.value, t('esim.sum'))

const when = (value: string) => new Intl.DateTimeFormat(locale.value, {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(value))

const tariff = (title: string) => title
    .replace('Unlimited', t('esim.unlimited'))
    .replace(/(\d+(?:\.\d+)?) GB/, (_, n) => t('esim.gb', { n }))
    .replace(/(\d+) days/, (_, n) => t('esim.days', { n: Number(n) }, Number(n)))

useSeoMeta({ title: () => t('cms.esim.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_esim-purchases.scss';
</style>
