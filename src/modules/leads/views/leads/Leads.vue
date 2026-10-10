<template>
    <div class="tm-cms-leads">
        <SectionHead
            :level="1"
            :title="archived ? t('cms.archive.leadsTitle') : t('cms.leads.title')"
            :sub="archived ? t('cms.archive.leadsLead') : t('cms.leads.lead', counts)"
        />

        <div class="tm-cms-leads__bar">
            <Tabs v-if="!archived" v-model="tab" :items="tabs" variant="segment" :aria-label="t('cms.leads.title')" />

            <SearchField
                v-model="query"
                :label="t('cms.leads.search')"
                :placeholder="t('cms.leads.searchPlaceholder')"
                icon="search"
                clearable
                class="tm-cms-leads__search"
            />

            <SelectMenu v-if="elevated && !archived" v-model="person" :options="personOptions" class="tm-cms-leads__person" />

            <Button v-if="!archived" size="md" class="tm-cms-leads__add" @click="creating = true">{{ t('cms.leads.create.cta') }}</Button>
        </div>

        <EditorSkeleton v-if="status === 'pending' && !leads.length" variant="rows" />

        <p v-else-if="!leads?.length" class="tm-cms-leads__empty">
            {{ archived ? t('cms.archive.empty') : query ? t('cms.leads.noMatches') : tab === 'none' ? t('cms.leads.list.noFree') : t('cms.leads.empty') }}
        </p>

        <table v-else class="tm-cms-leads__table">
            <thead>
                <tr>
                    <th
                        v-for="column in COLUMNS" :key="column.key"
                        scope="col" :class="column.class"
                        :aria-sort="column.sort && sort === column.sort ? (direction === 'asc' ? 'ascending' : 'descending') : undefined"
                    >
                        <button v-if="column.sort" type="button" class="tm-cms-leads__sort" @click="sortBy(column.sort)">
                            {{ t(column.label) }}
                            <Icon v-if="sort === column.sort" :name="direction === 'asc' ? 'chevron-up' : 'chevron'" :size="12" />
                        </button>
                        <span v-else class="tm-cms-leads__sort">{{ t(column.label) }}</span>
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="lead in leads" :key="lead.uuid"
                    class="tm-cms-leads__row" :class="{ 'is-free': !lead.manager_id }"
                    tabindex="0"
                    @click="go(lead)"
                    @keydown.enter="go(lead)"
                >
                    <td class="is-client">
                        <span class="tm-cms-leads__name">{{ clientOf(lead) }}</span>
                        <span class="tm-cms-leads__line">{{ lead.phone }}</span>
                        <span class="tm-cms-leads__meta">
                            <span class="tm-cms-leads__ref">{{ lead.ref }}</span>
                            · {{ shortDate(lead.created_at) }} · {{ t(`cms.leads.list.${lead.source}`) }}<template v-if="(lead.trip_no ?? 1) > 1"> · {{ t('cms.leads.trip.number', { n: lead.trip_no }) }}</template>
                        </span>
                    </td>

                    <td class="is-tour">
                        <template v-if="lead.hotel_name">
                            <span class="tm-cms-leads__name is-plain">{{ lead.hotel_name }}</span>
                            <span class="tm-cms-leads__line">{{ tripOf(lead) }}</span>
                        </template>
                        <span v-else class="tm-cms-leads__line is-faint">{{ t('cms.leads.list.noTour') }}</span>
                    </td>

                    <td class="is-price">
                        <span class="tm-cms-leads__price">{{ money(lead) }}</span>
                        <span v-if="lead.supplier_name" class="tm-cms-leads__line">{{ lead.supplier_name }}</span>
                    </td>

                    <td class="is-status" @click.stop>
                        <SelectMenu
                            :model-value="lead.status"
                            :options="rowOptions"
                            :tone="lead.status"
                            size="sm"
                            align="right"
                            @update:model-value="change(lead, $event as LeadStatus)"
                        />
                    </td>

                    <td class="is-owner" @click.stop="lead.manager_id ? go(lead) : undefined">
                        <Button
                            v-if="!lead.manager_id"
                            size="sm" icon="plus"
                            :disabled="taking === lead.uuid"
                            class="tm-cms-leads__take"
                            @click.stop="takeLead(lead)"
                        >{{ t('cms.leads.list.take') }}</Button>
                        <span v-else class="tm-cms-leads__owner" :class="{ 'is-me': lead.manager_id === me }">
                            <span class="tm-cms-leads__avatar" aria-hidden="true">{{ initials(lead.manager_name) }}</span>
                            <span class="tm-cms-leads__owner-name">{{ lead.manager_id === me ? t('cms.ownership.you') : lead.manager_name || '—' }}</span>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>

        <Pagination
            :page="page" :pages="pages" :total="total" :per-page="perPage"
            @update:page="setPage" @update:per-page="setPerPage"
        />

        <ManualLeadModal v-model="creating" @created="onCreated" />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import ManualLeadModal from '~/modules/leads/components/manualLeadModal/ManualLeadModal.vue'
import Pagination from '~/shared/components/pagination/Pagination.vue'
import Tabs from '~/shared/components/tabs/Tabs.vue'
import { useLeads } from './Leads.hooks'
import { COLUMNS } from './Leads.config'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const creating = ref(false)

const {
    leads, status, archived, query, sort, direction,
    elevated, me, tab, tabs, person, personOptions, taking, takeLead,
    rowOptions, counts, sortBy, change, refresh,
    page, pages, total, perPage, setPage, setPerPage,
} = useLeads()

const clientOf = (lead: ILeadRaw) => [lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'

const initials = (name: string) => name.split(/\s+/).map(part => part[0] ?? '').join('').slice(0, 2).toUpperCase() || '—'

const tripOf = (lead: ILeadRaw): string => {
    const guests = lead.adults + lead.children

    return [
        lead.check_in ? shortDate(lead.check_in) : '',
        lead.nights ? t('search.nights', { n: lead.nights }, lead.nights) : '',
        guests ? t('cms.leads.list.guests', { n: guests }, guests) : '',
    ].filter(Boolean).join(' · ')
}

const go = (lead: ILeadRaw) => navigateTo(localePath(`/app/leads/${lead.uuid}`))

async function onCreated(lead: ILeadRaw) {
    await refresh()
    await go(lead)
}

const shortDate = (value: string): string =>
    new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: 'short' }).format(new Date(value))

const money = (lead: ILeadRaw): string => {
    if (lead.price_amount === null) return '—'

    return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: lead.price_currency || 'USD',
        maximumFractionDigits: 0,
    }).format(lead.price_amount)
}

useSeoMeta({ title: () => t('cms.leads.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_leads.scss';
</style>
