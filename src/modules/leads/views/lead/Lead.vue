<template>
    <div class="tm-cms-lead">
        <NuxtLink :to="localePath('/app/leads')" class="tm-cms-lead__back">
            <Icon name="chevron-left" :size="16" />{{ t('cms.leads.backToList') }}
        </NuxtLink>

        <EditorSkeleton v-if="status === 'pending'" variant="form" />

        <p v-else-if="!lead" class="tm-cms-lead__empty">{{ t('cms.leads.missing') }}</p>

        <template v-else>
            <header class="tm-cms-lead__head">
                <div>
                    <h1 class="tm-cms-lead__number">#{{ lead.order_id }}</h1>
                    <p class="tm-cms-lead__sub">
                        {{ t(`cms.leads.sources.${lead.source}`) }} · {{ fullDate(lead.created_at) }}
                    </p>
                </div>

                <div class="tm-cms-lead__head-actions">
                    <select
                        class="tm-cms-lead__status" :class="`is-${lead.status}`"
                        :value="lead.status" :disabled="saving"
                        :aria-label="t('cms.leads.columns.status')"
                        @change="change(($event.target as HTMLSelectElement).value as LeadStatus)"
                    >
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>

                    <Button type="button" variant="ghost" @click="remove">{{ t('cms.leads.delete') }}</Button>
                </div>
            </header>

            <p v-if="error" class="tm-cms-lead__error" role="alert">{{ error }}</p>
            <p v-else-if="saved" class="tm-cms-lead__saved" role="status">{{ t('cms.saved') }}</p>

            <div class="tm-cms-lead__grid">
                <section class="tm-cms-lead__card">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.client') }}</h2>

                    <dl class="tm-cms-lead__facts">
                        <div>
                            <dt>{{ t('cms.leads.columns.client') }}</dt>
                            <dd>{{ [lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—' }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.phone') }}</dt>
                            <dd><a :href="`tel:${lead.phone}`">{{ lead.phone }}</a></dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.locale') }}</dt>
                            <dd>{{ lead.locale.toUpperCase() }}</dd>
                        </div>
                    </dl>

                    <div v-if="lead.comment" class="tm-cms-lead__comment">
                        <span class="tm-cms-lead__key">{{ t('cms.leads.columns.comment') }}</span>
                        <p>{{ lead.comment }}</p>
                    </div>
                </section>

                <section class="tm-cms-lead__card">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.order') }}</h2>

                    <dl class="tm-cms-lead__facts">
                        <div>
                            <dt>{{ t('cms.leads.columns.order') }}</dt>
                            <dd class="tm-cms-lead__mono">#{{ lead.order_id }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.updated') }}</dt>
                            <dd>{{ fullDate(lead.updated_at) }}</dd>
                        </div>
                    </dl>

                    <div class="tm-cms-lead__supplier-order">
                        <Input
                            v-model="supplierOrderId"
                            :label="t('cms.leads.columns.supplierOrder')"
                            :hint="t('cms.leads.supplierOrderHint')"
                            placeholder="—"
                        />

                        <Button type="button" size="sm" :disabled="saving" @click="saveSupplierOrder">
                            {{ saving ? t('cms.saving') : t('cms.save') }}
                        </Button>
                    </div>
                </section>

                <section class="tm-cms-lead__card tm-cms-lead__card--wide">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.trip') }}</h2>

                    <dl class="tm-cms-lead__facts is-columns">
                        <div>
                            <dt>{{ t('cms.leads.columns.tour') }}</dt>
                            <dd>{{ lead.hotel_name || '—' }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.supplier') }}</dt>
                            <dd>{{ lead.supplier_name || '—' }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.route') }}</dt>
                            <dd>{{ lead.route_from || '—' }} → {{ lead.route_to || '—' }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.dates') }}</dt>
                            <dd>{{ lead.check_in ? `${shortDate(lead.check_in)} · ${lead.nights}` : '—' }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.party') }}</dt>
                            <dd>{{ lead.adults }}<template v-if="lead.children">+{{ lead.children }}</template></dd>
                        </div>
                        <div>
                            <dt>{{ t('cms.leads.columns.price') }}</dt>
                            <dd>{{ money(lead) }}</dd>
                        </div>
                    </dl>
                </section>

                <section v-if="extras.length" class="tm-cms-lead__card tm-cms-lead__card--wide">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.raw') }}</h2>

                    <dl class="tm-cms-lead__raw">
                        <div v-for="entry in extras" :key="entry.key">
                            <dt>{{ entry.key }}</dt>
                            <dd>{{ entry.value }}</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import { useLead } from './Lead.hooks'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const {
    lead, status, error, saving, saved,
    supplierOrderId, statusOptions, change, saveSupplierOrder, remove,
} = useLead()

const shortDate = (value: string): string =>
    new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))

const fullDate = (value: string): string =>
    new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const money = (row: ILeadRaw): string => {
    if (row.price_amount === null) return '—'

    return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: row.price_currency || 'USD',
        maximumFractionDigits: 0,
    }).format(row.price_amount)
}

const KNOWN = new Set([
    'hotel_name', 'supplier_name', 'check_in', 'nights', 'adults', 'children',
    'price_amount', 'price_currency', 'route_from', 'route_to',
])

const extras = computed(() =>
    Object.entries(lead.value?.trip ?? {})
        .filter(([key, value]) => !KNOWN.has(key) && value !== null && value !== '' && value !== undefined)
        .map(([key, value]) => ({ key, value: String(value) })))

useSeoMeta({ title: () => t('cms.leads.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_lead.scss';
</style>
