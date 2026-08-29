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

        <div v-else class="tm-cms-leads__scroll">
            <table class="tm-cms-leads__table">
                <thead>
                    <tr>
                        <th scope="col" class="is-num">{{ t('cms.leads.columns.order') }}</th>
                        <th scope="col" class="is-when">{{ t('cms.leads.columns.created') }}</th>
                        <th scope="col">{{ t('cms.leads.columns.client') }}</th>
                        <th scope="col">{{ t('cms.leads.columns.phone') }}</th>
                        <th scope="col">{{ t('cms.leads.columns.tour') }}</th>
                        <th scope="col" class="is-when">{{ t('cms.leads.columns.dates') }}</th>
                        <th scope="col" class="is-num">{{ t('cms.leads.columns.party') }}</th>
                        <th scope="col" class="is-num">{{ t('cms.leads.columns.price') }}</th>
                        <th scope="col">{{ t('cms.leads.columns.supplier') }}</th>
                        <th scope="col">{{ t('cms.leads.columns.status') }}</th>
                        <th scope="col"><span class="tm-cms-leads__sr">{{ t('cms.leads.columns.actions') }}</span></th>
                    </tr>
                </thead>

                <tbody>
                    <template v-for="lead in leads" :key="lead.uuid">
                        <tr :class="{ 'is-fresh': lead.status === 'new' }">
                            <td class="is-num">
                                <NuxtLink :to="localePath(`/app/leads/${lead.uuid}`)" class="tm-cms-leads__order">
                                    #{{ lead.order_id }}
                                </NuxtLink>
                            </td>

                            <td class="is-when">{{ shortDate(lead.created_at) }}</td>

                            <td>
                                <button type="button" class="tm-cms-leads__name" @click="toggle(lead.uuid)">
                                    {{ [lead.first_name, lead.last_name].filter(Boolean).join(' ') }}
                                    <Icon :name="expanded === lead.uuid ? 'chevron-up' : 'chevron'" :size="14" />
                                </button>
                            </td>

                            <td><a :href="`tel:${lead.phone}`" class="tm-cms-leads__phone">{{ lead.phone }}</a></td>

                            <td class="tm-cms-leads__tour">{{ lead.hotel_name || '—' }}</td>

                            <td class="is-when">{{ lead.check_in ? `${shortDate(lead.check_in)} · ${lead.nights}` : '—' }}</td>

                            <td class="is-num">{{ lead.adults }}<template v-if="lead.children">+{{ lead.children }}</template></td>

                            <td class="is-num">{{ money(lead) }}</td>

                            <td>{{ lead.supplier_name || '—' }}</td>

                            <td>
                                <select
                                    class="tm-cms-leads__status" :class="`is-${lead.status}`"
                                    :value="lead.status"
                                    :aria-label="t('cms.leads.columns.status')"
                                    @change="change(lead, ($event.target as HTMLSelectElement).value as LeadStatus)"
                                >
                                    <option v-for="option in rowOptions" :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </option>
                                </select>
                            </td>

                            <td>
                                <button
                                    type="button" class="tm-cms-leads__delete"
                                    :aria-label="t('cms.leads.delete')" :title="t('cms.leads.delete')"
                                    @click="remove(lead.uuid)"
                                >
                                    <Icon name="close" :size="15" />
                                </button>
                            </td>
                        </tr>

                        <tr v-if="expanded === lead.uuid" class="tm-cms-leads__detail">
                            <td colspan="11">
                                <div class="tm-cms-leads__detail-grid">
                                    <div v-if="lead.comment" class="tm-cms-leads__note">
                                        <span class="tm-cms-leads__key">{{ t('cms.leads.columns.comment') }}</span>
                                        <p>{{ lead.comment }}</p>
                                    </div>

                                    <dl class="tm-cms-leads__trip">
                                        <div v-if="lead.supplier_order_id">
                                            <dt>{{ t('cms.leads.columns.supplierOrder') }}</dt>
                                            <dd>{{ lead.supplier_order_id }}</dd>
                                        </div>

                                        <div v-for="entry in tripEntries(lead)" :key="entry.key">
                                            <dt>{{ entry.key }}</dt>
                                            <dd>{{ entry.value }}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <ManualLeadModal v-model="creating" @created="onCreated" />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import ManualLeadModal from '~/modules/leads/components/manualLeadModal/ManualLeadModal.vue'
import { useLeads } from './Leads.hooks'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const creating = ref(false)

const {
    leads, status, error, filter, expanded,
    statusOptions, rowOptions, counts,
    change, remove, toggle, refresh,
} = useLeads()

async function onCreated(lead: ILeadRaw) {
    await refresh()
    await navigateTo(localePath(`/app/leads/${lead.uuid}`))
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

const tripEntries = (lead: ILeadRaw): Array<{ key: string, value: string }> =>
    Object.entries(lead.trip)
        .filter(([, value]) => value !== null && value !== '' && value !== undefined)
        .map(([key, value]) => ({ key, value: String(value) }))

useSeoMeta({ title: () => t('cms.leads.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_leads.scss';
</style>
