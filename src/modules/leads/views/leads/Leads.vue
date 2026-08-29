<template>
    <div class="tm-cms-leads">
        <SectionHead
            :level="1"
            :title="t('cms.leads.title')"
            :sub="t('cms.leads.lead', counts)"
        />

        <p v-if="error" class="tm-cms-leads__error" role="alert">{{ error }}</p>

        <div class="tm-cms-leads__actions">
            <SearchField
                v-model="query"
                :label="t('cms.leads.search')"
                :placeholder="t('cms.leads.searchPlaceholder')"
                icon="search"
                clearable
                class="tm-cms-leads__search"
            />

            <Button size="md" @click="creating = true">{{ t('cms.leads.create.cta') }}</Button>
        </div>

        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <p v-else-if="!leads?.length" class="tm-cms-leads__empty">
            {{ query ? t('cms.leads.noMatches') : t('cms.leads.empty') }}
        </p>

        <table v-else class="tm-cms-leads__table">
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
                    <td class="is-num tm-cms-leads__order">#{{ lead.order_id }}</td>
                    <td class="is-muted">{{ shortDate(lead.created_at) }}</td>
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
                </tr>
            </tbody>
        </table>

        <ManualLeadModal v-model="creating" @created="onCreated" />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import ManualLeadModal from '~/modules/leads/components/manualLeadModal/ManualLeadModal.vue'
import { useLeads } from './Leads.hooks'
import { COLUMNS } from './Leads.config'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const creating = ref(false)

const {
    leads, status, error, query, sort, direction,
    rowOptions, counts, sortBy, change, refresh,
} = useLeads()

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
