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
                    <h1 class="tm-cms-lead__number">{{ lead.ref }}</h1>
                    <p class="tm-cms-lead__sub">
                        {{ t(`cms.leads.channels.${lead.channel}`) }} · {{ fullDate(lead.created_at) }}
                        <template v-if="lead.user_id"> · {{ t('cms.leads.registered') }}</template>
                    </p>
                    <p class="tm-cms-lead__compliance">
                        <span :class="response.overdue ? 'is-late' : 'is-ok'">{{ responseText }}</span>
                        <span v-if="lead.consent_at">{{ t('cms.leads.consentGiven', { date: fullDate(lead.consent_at) }) }}</span>
                    </p>
                </div>

                <div class="tm-cms-lead__head-actions">
                    <SelectMenu
                        :model-value="lead.status"
                        :options="statusOptions"
                        :tone="lead.status"
                        :disabled="saving"
                        align="right"
                        @update:model-value="change($event as LeadStatus)"
                    />

                    <Button type="button" variant="danger-quiet" @click="remove">{{ t('cms.leads.delete') }}</Button>
                </div>
            </header>

            <p v-if="saved" class="tm-cms-lead__saved" role="status">{{ t('cms.saved') }}</p>

            <LeadOwner :lead="lead" class="tm-cms-lead__card" @changed="owned" />

            <section class="tm-cms-lead__card">
                <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.offer') }}</h2>

                <p class="tm-cms-lead__offer-lead">{{ t('cms.leads.offer.lead') }}</p>

                <div class="tm-cms-lead__offer-links">
                    <Button
                        size="sm" variant="secondary" icon="search"
                        :to="pickToursLink"
                    >
                        {{ t('cms.leads.offer.repeatSearch') }}
                    </Button>

                    <Button
                        v-if="links.booking"
                        size="sm" variant="ghost" icon="arrow-right"
                        :href="links.booking" target="_blank" rel="noopener"
                    >
                        {{ t('cms.leads.openAtOperator') }}
                    </Button>

                    <Button
                        v-if="links.hotel"
                        size="sm" variant="ghost" icon="bed"
                        :href="links.hotel" target="_blank" rel="noopener"
                    >
                        {{ t('cms.leads.openHotelPage') }}
                    </Button>
                </div>

                <p v-if="!links.booking" class="tm-cms-lead__offer-note">{{ t('cms.leads.noBookingUrl') }}</p>
            </section>

            <CustomerPoints v-if="lead.user_id" :user-id="lead.user_id" class="tm-cms-lead__points" />

            <form class="tm-cms-lead__form" novalidate @submit.prevent="submit">
                <section class="tm-cms-lead__card">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.client') }}</h2>

                    <dl class="tm-cms-lead__facts is-columns">
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
                </section>

                <section class="tm-cms-lead__card">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.request') }}</h2>

                    <div class="tm-cms-lead__row">
                        <Input v-model="draft.destination" :label="t('cms.leads.fields.destination')" />
                        <Input
                            v-model="draft.plannedDates"
                            :label="t('cms.leads.fields.plannedDates')"
                            :hint="t('cms.leads.fields.plannedDatesHint')"
                        />
                        <Input v-model="draft.partySize" type="number" :label="t('cms.leads.fields.partySize')" />
                    </div>

                    <div class="tm-cms-lead__row">
                        <PriceInput
                            v-model="draft.budgetAmount"
                            :label="t('cms.leads.fields.budget')"
                            :currency="draft.budgetCurrency"
                        />
                        <CurrencySelect v-model="draft.budgetCurrency" :label="t('cms.leads.fields.budgetCurrency')" clearable />
                        <div />
                    </div>

                    <div class="tm-cms-lead__field">
                        <label :for="commentId" class="tm-cms-lead__label">{{ t('cms.leads.columns.comment') }}</label>
                        <textarea :id="commentId" v-model="draft.comment" class="tm-cms-lead__textarea" rows="3" />
                    </div>

                    <div v-if="lead.status === 'rejected'" class="tm-cms-lead__field">
                        <label :for="reasonId" class="tm-cms-lead__label">{{ t('cms.leads.fields.rejectReason') }}</label>
                        <textarea :id="reasonId" v-model="draft.rejectReason" class="tm-cms-lead__textarea" rows="2" />
                    </div>
                </section>

                <footer class="tm-cms-lead__foot">
                    <Button type="submit" size="lg" :disabled="saving">
                        {{ saving ? t('cms.saving') : t('cms.save') }}
                    </Button>
                </footer>
            </form>

            <section v-if="extras.length" class="tm-cms-lead__card">
                <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.raw') }}</h2>

                <dl class="tm-cms-lead__raw">
                    <div v-for="entry in extras" :key="entry.key">
                        <dt>{{ entry.key }}</dt>
                        <dd>{{ entry.value }}</dd>
                    </div>
                </dl>
            </section>

            <section class="tm-cms-lead__card tm-cms-lead__orders">
                <header class="tm-cms-lead__orders-head">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.orders') }}</h2>

                    <Button type="button" size="sm" variant="ghost" icon="plus" @click="addOrder">
                        {{ t('cms.leads.addOrder') }}
                    </Button>
                </header>

                <p v-if="!orders.length" class="tm-cms-lead__no-orders">{{ t('cms.leads.noOrders') }}</p>

                <ul v-else class="tm-cms-lead__order-list">
                    <li v-for="order in orders" :key="order.uuid">
                        <NuxtLink :to="localePath(`/app/orders/${order.uuid}`)" class="tm-cms-lead__order">
                            <span class="tm-cms-lead__order-no">{{ order.ref }}</span>

                            <span class="tm-cms-lead__order-main">
                                <span class="tm-cms-lead__order-hotel">{{ order.hotel_name || '—' }}</span>
                                <span class="tm-cms-lead__order-meta">
                                    {{ order.check_in ? `${shortDate(order.check_in)} · ${order.nights}` : '—' }}
                                    <template v-if="order.supplier_name"> · {{ order.supplier_name }}</template>
                                </span>
                            </span>

                            <span class="tm-cms-lead__order-status" :class="`is-${order.status}`">
                                {{ t(`cms.orders.status.${order.status}`) }}
                            </span>
                        </NuxtLink>
                    </li>
                </ul>
            </section>

            <LeadHistory :lead-id="lead.uuid" :version="historyVersion" class="tm-cms-lead__card tm-cms-lead__history" />
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import { useLead } from './Lead.hooks'
import Button from '~/shared/components/button/Button.vue'
import { formatDate } from '~/shared/helpers/format-date'
import PriceInput from '~/shared/components/priceInput/PriceInput.vue'
import CurrencySelect from '~/shared/components/currencySelect/CurrencySelect.vue'
import { offerLinks } from '~/modules/leads/helpers/offer'
import CustomerPoints from '~/modules/points/components/customerPoints/CustomerPoints.vue'
import LeadOwner from '~/modules/leads/components/leadOwner/LeadOwner.vue'
import LeadHistory from '~/modules/leads/components/leadHistory/LeadHistory.vue'
import { RESPONSE_SLA_MINUTES } from '~/modules/leads/contracts/leads'
import { leadResponse, waitLabel } from '~/modules/leads/helpers/compliance'
import type { LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const commentId = useId()
const reasonId = useId()

const {
    lead, draft, orders, status, error, saving, saved,
    historyVersion, owned,
    statusOptions, change, submit, addOrder, remove,
} = useLead()

const shortDate = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { day: '2-digit', month: 'short' })

const fullDate = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { dateStyle: 'medium', timeStyle: 'short' })

const links = computed(() => offerLinks(lead.value?.trip as never))

const KNOWN = new Set([
    'hotel_name', 'supplier_name', 'check_in', 'nights', 'adults', 'children',
    'price_amount', 'price_currency', 'route_from', 'route_to',
    'booking_url', 'hotel_url',
])

const plain = (value: unknown): string =>
    String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const extras = computed(() =>
    Object.entries(lead.value?.trip ?? {})
        .filter(([key, value]) => !KNOWN.has(key) && value !== null && value !== '' && value !== undefined)
        .map(([key, value]) => ({ key, value: plain(value) }))
        .filter(entry => entry.value))

useSeoMeta({ title: () => t('cms.leads.title'), robots: 'noindex, nofollow' })

const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

onMounted(() => { ticker = setInterval(() => { now.value = Date.now() }, 30_000) })
onBeforeUnmount(() => { if (ticker) clearInterval(ticker) })

const response = computed(() => (lead.value
    ? leadResponse(lead.value, now.value)
    : { minutes: 0, overdue: false, answered: false }))

const responseText = computed(() => {
    const wait = waitLabel(response.value.minutes, t)

    if (response.value.answered) return t('cms.leads.sla.answered', { wait })

    return response.value.overdue
        ? t('cms.leads.sla.waitingLate', { wait, n: RESPONSE_SLA_MINUTES })
        : t('cms.leads.sla.waiting', { wait })
})

const pickToursLink = computed(() => {
    if (!lead.value) return ''

    const base = links.value.search || '/search?'
    const joiner = base.endsWith('?') ? '' : '&'

    return `${base}${joiner}lead=${lead.value.uuid}`
})
</script>

<style lang="scss">
@use './_lead.scss';
</style>
