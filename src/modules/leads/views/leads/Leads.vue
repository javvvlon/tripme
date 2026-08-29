<template>
    <div class="tm-cms-leads">
        <SectionHead
            :level="1"
            :title="t('cms.leads.title')"
            :sub="t('cms.leads.lead', counts)"
        />

        <p v-if="error" class="tm-cms-leads__error" role="alert">{{ error }}</p>

        <div class="tm-cms-leads__actions">
            <Tabs v-model="filter" :items="statusOptions" variant="segment" :aria-label="t('cms.leads.filters.label')" />

            <Button size="md" @click="creating = true">{{ t('cms.leads.create.cta') }}</Button>
        </div>

        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <p v-else-if="!leads?.length" class="tm-cms-leads__empty">{{ t('cms.leads.empty') }}</p>

        <table v-else class="tm-cms-leads__table">
            <thead>
                <tr>
                    <th scope="col" class="is-num">{{ t('cms.leads.columns.order') }}</th>
                    <th scope="col">{{ t('cms.leads.columns.created') }}</th>
                    <th scope="col">{{ t('cms.leads.columns.client') }}</th>
                    <th scope="col">{{ t('cms.leads.columns.tour') }}</th>
                    <th scope="col">{{ t('cms.leads.columns.dates') }}</th>
                    <th scope="col" class="is-num">{{ t('cms.leads.columns.price') }}</th>
                    <th scope="col" class="is-status">{{ t('cms.leads.columns.status') }}</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="lead in leads" :key="lead.uuid"
                    class="tm-cms-leads__row" :class="{ 'is-fresh': lead.status === 'new' }"
                    tabindex="0"
                    @click="go(lead)"
                    @keydown.enter="go(lead)"
                >
                    <td class="is-num tm-cms-leads__order">#{{ lead.order_id }}</td>

                    <td class="is-muted">{{ shortDate(lead.created_at) }}</td>

                    <td>
                        <span class="tm-cms-leads__name">
                            {{ [lead.first_name, lead.last_name].filter(Boolean).join(' ') }}
                        </span>
                        <span class="tm-cms-leads__second">{{ lead.phone }}</span>
                    </td>

                    <td>
                        <span class="tm-cms-leads__tour">{{ lead.hotel_name || '—' }}</span>
                        <span class="tm-cms-leads__second">{{ lead.supplier_name || '—' }}</span>
                    </td>

                    <td class="is-muted">
                        <template v-if="lead.check_in">
                            {{ shortDate(lead.check_in) }} · {{ lead.nights }}
                            <span class="tm-cms-leads__second">
                                {{ lead.adults }}<template v-if="lead.children">+{{ lead.children }}</template>
                            </span>
                        </template>
                        <template v-else>—</template>
                    </td>

                    <td class="is-num">{{ money(lead) }}</td>

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
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const creating = ref(false)

const {
    leads, status, error, filter,
    statusOptions, rowOptions, counts,
    change, refresh,
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
