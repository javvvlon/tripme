<template>
    <div class="tm-cms-leads">
        <SectionHead
            :level="1"
            :title="t('cms.leads.title')"
            :sub="t('cms.leads.lead', counts)"
        />


        <div class="tm-cms-leads__actions">
            <SearchField
                v-model="query"
                :label="t('cms.leads.search')"
                :placeholder="t('cms.leads.searchPlaceholder')"
                icon="search"
                clearable
                class="tm-cms-leads__search"
            />

            <SelectMenu
                v-model="managerFilter"
                :options="filterOptions"
                class="tm-cms-leads__owner"
            />

            <Button size="md" @click="creating = true">{{ t('cms.leads.create.cta') }}</Button>
        </div>

        <EditorSkeleton v-if="status === 'pending' && !leads.length" variant="rows" />

        <p v-else-if="!leads?.length" class="tm-cms-leads__empty">
            {{ query ? t('cms.leads.noMatches') : t('cms.leads.empty') }}
        </p>

        <div v-else class="tm-cms-leads__scroll">
        <table class="tm-cms-leads__table">
            <thead>
                <tr>
                    <th
                        v-for="column in COLUMNS" :key="column.key"
                        scope="col" :class="column.class"
                        :aria-sort="sort === column.key ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'"
                    >
                        <button type="button" class="tm-cms-leads__sort" @click="sortBy(column.key)">
                            {{ t(`cms.leads.columns.${column.key}`) }}
                            <Icon
                                v-if="sort === column.key"
                                :name="direction === 'asc' ? 'chevron-up' : 'chevron'" :size="12"
                            />
                        </button>
                    </th>
                    <th scope="col" class="is-owner"><span class="tm-cms-leads__sort">{{ t('cms.ownership.column') }}</span></th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="lead in leads" :key="lead.uuid"
                    class="tm-cms-leads__row"
                    tabindex="0"
                    @click="go(lead)"
                    @keydown.enter="go(lead)"
                >
                    <td class="is-num tm-cms-leads__order">{{ lead.ref }}</td>
                    <td class="is-muted">
                        {{ shortDate(lead.created_at) }}
                        <span
                            v-if="response(lead).overdue && !response(lead).answered"
                            class="tm-cms-leads__sla"
                            :title="t('cms.leads.sla.overdueHint', { n: RESPONSE_SLA_MINUTES })"
                        >{{ waitLabel(response(lead).minutes, t) }}</span>
                    </td>
                    <td class="tm-cms-leads__strong">{{ [lead.first_name, lead.last_name].filter(Boolean).join(' ') }}</td>
                    <td class="is-muted">{{ lead.phone }}</td>
                    <td class="tm-cms-leads__truncate">{{ lead.hotel_name || '—' }}</td>
                    <td class="is-muted">{{ lead.check_in ? `${shortDate(lead.check_in)} · ${lead.nights}` : '—' }}</td>
                    <td class="is-num">{{ lead.adults }}<template v-if="lead.children">+{{ lead.children }}</template></td>
                    <td class="is-num">{{ money(lead) }}</td>
                    <td class="tm-cms-leads__truncate">{{ lead.supplier_name || '—' }}</td>

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

                    <td class="is-owner">
                        <span v-if="!lead.manager_id" class="tm-cms-leads__queue">{{ t('cms.ownership.queue') }}</span>
                        <span v-else-if="lead.manager_id === me" class="tm-cms-leads__mine">{{ t('cms.ownership.you') }}</span>
                        <span v-else class="tm-cms-leads__truncate">{{ lead.manager_name || '—' }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>

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
import { useLeads } from './Leads.hooks'
import { COLUMNS } from './Leads.config'
import { RESPONSE_SLA_MINUTES } from '~/modules/leads/contracts/leads'
import { leadResponse, waitLabel } from '~/modules/leads/helpers/compliance'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const creating = ref(false)

const {
    leads, status, error, query, sort, direction,
    managerFilter, filterOptions, me,
    rowOptions, counts, sortBy, change, refresh,
    page, pages, total, perPage, setPage, setPerPage,
} = useLeads()

const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

onMounted(() => { ticker = setInterval(() => { now.value = Date.now() }, 30_000) })
onBeforeUnmount(() => { if (ticker) clearInterval(ticker) })

const response = (lead: ILeadRaw) => leadResponse(lead, now.value)

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
