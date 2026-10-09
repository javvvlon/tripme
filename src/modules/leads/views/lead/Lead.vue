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
                    <p v-if="lead.consent_at" class="tm-cms-lead__compliance">
                        <span>{{ t('cms.leads.consentGiven', { date: fullDate(lead.consent_at) }) }}</span>
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

                    <Button v-if="!lead.archived_at" type="button" variant="secondary" icon="folder" @click="archive">
                        {{ t('cms.archive.action') }}
                    </Button>
                </div>
            </header>

            <section v-if="lead.archived_at" class="tm-cms-archived" role="status">
                <Icon name="folder" :size="18" />
                <span>{{ t('cms.archive.leadSince', { date: fullDate(lead.archived_at) }) }}</span>
                <Button type="button" size="sm" variant="secondary" icon="undo" @click="restore">{{ t('cms.archive.restore') }}</Button>
            </section>

            <p v-if="saved" class="tm-cms-lead__saved" role="status">{{ t('cms.saved') }}</p>

            <LeadOwner v-if="lead.manager_id !== me" :lead="lead" class="tm-cms-lead__card" @changed="owned" />

            <section class="tm-cms-lead__card">
                <header class="tm-cms-lead__offer-head">
                    <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.offer') }}</h2>

                    <div v-if="hasTour && !picking" class="tm-cms-lead__offer-actions">
                        <Button
                            type="button" size="sm" variant="ghost" icon="pencil"
                            :disabled="saving"
                            @click="picking = true"
                        >
                            {{ t('cms.leads.offer.replace') }}
                        </Button>

                        <Button
                            type="button" size="sm" variant="danger-quiet" icon="trash"
                            :disabled="saving"
                            @click="clearTour"
                        >
                            {{ t('cms.leads.offer.clear') }}
                        </Button>
                    </div>
                </header>

                <template v-if="picking">
                    <TourPicker :selected="null" :initial="pickerSeed" @update:selected="assign" />

                    <div class="tm-cms-lead__offer-links is-end">
                        <Button type="button" size="sm" variant="ghost" :disabled="saving" @click="picking = false">
                            {{ t('common.cancel') }}
                        </Button>
                    </div>
                </template>

                <template v-else-if="hasTour">
                    <div class="tm-cms-lead__tour">
                        <div class="tm-cms-lead__tour-main">
                            <p class="tm-cms-lead__tour-name">
                                {{ lead.hotel_name }}
                                <span v-if="stars" class="tm-cms-lead__tour-stars" :aria-label="`${stars}★`">{{ '★'.repeat(stars) }}</span>
                            </p>
                            <p v-if="tourMeta" class="tm-cms-lead__tour-meta">{{ tourMeta }}</p>
                            <p class="tm-cms-lead__tour-meta">
                                <template v-if="lead.check_in">{{ formatDateRange(lead.check_in, lead.nights, locale) }} · </template>{{ party }}
                            </p>
                        </div>

                        <p v-if="tourPrice" class="tm-cms-lead__tour-price">{{ tourPrice }}</p>
                    </div>

                    <div class="tm-cms-lead__offer-links">
                        <Button size="sm" variant="secondary" icon="search" :to="pickToursLink">
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
                </template>

                <div v-else class="tm-cms-lead__offer-empty">
                    <p class="tm-cms-lead__offer-title">{{ t('cms.leads.offer.empty') }}</p>
                    <blockquote v-if="lead.comment" class="tm-cms-lead__offer-quote">{{ lead.comment }}</blockquote>
                    <p class="tm-cms-lead__offer-hint">{{ t('cms.leads.offer.emptyHint') }}</p>

                    <div class="tm-cms-lead__offer-links">
                        <Button type="button" size="sm" icon="plus" @click="picking = true">
                            {{ t('cms.leads.offer.pick') }}
                        </Button>

                        <Button size="sm" variant="secondary" icon="search" :to="pickToursLink">
                            {{ t('cms.leads.offer.inSearch') }}
                        </Button>
                    </div>
                </div>
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

                    <Button
                        type="button" size="sm" variant="ghost" icon="plus"
                        :disabled="!hasTour"
                        :title="hasTour ? undefined : t('cms.leads.orderNeedsTour')"
                        @click="addOrder"
                    >
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

                            <span v-if="order.archived_at" class="tm-cms-lead__order-status is-archived">{{ t('cms.archive.badge') }}</span>
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
import TourPicker from '~/modules/leads/components/tourPicker/TourPicker.vue'
import { formatDateRange, formatMoney } from '~/shared/utils/format'
import CustomerPoints from '~/modules/points/components/customerPoints/CustomerPoints.vue'
import LeadOwner from '~/modules/leads/components/leadOwner/LeadOwner.vue'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import LeadHistory from '~/modules/leads/components/leadHistory/LeadHistory.vue'
import type { LeadStatus } from '~/modules/leads/contracts/leads'
import type { Money } from '~/search_engine/contracts/search'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const commentId = useId()
const reasonId = useId()

const {
    lead, draft, orders, status, error, saving, saved,
    historyVersion, owned,
    statusOptions, change, submit, addOrder, archive, restore,
    picking, hasTour, pickerSeed, assign, clearTour,
} = useLead()

const { me } = useManagers()

const shortDate = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { day: '2-digit', month: 'short' })

const fullDate = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { dateStyle: 'medium', timeStyle: 'short' })

const links = computed(() => offerLinks(lead.value ? { ...lead.value.trip, ...pickRoute(lead.value) } : null))

const pickRoute = (found: NonNullable<typeof lead.value>) => ({
    route_from: found.route_from || String(found.trip.route_from ?? ''),
    route_to: found.route_to || String(found.trip.route_to ?? ''),
    check_in: found.check_in,
    nights: found.nights,
    adults: found.adults,
    children: found.children,
})

const stars = computed(() => {
    const value = Number(lead.value?.trip.hotel_stars)
    const named = /\d\s*\*/.test(lead.value?.hotel_name ?? '')

    return !named && Number.isInteger(value) && value > 0 && value <= 5 ? value : 0
})

const tourMeta = computed(() =>
    [lead.value?.supplier_name, lead.value?.trip.meal_name, lead.value?.trip.room_name]
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
        .join(' · '))

const party = computed(() => {
    if (!lead.value) return ''

    const parts = [t('search.adults', { n: lead.value.adults }, lead.value.adults)]

    if (lead.value.children) parts.push(t('search.kids', { n: lead.value.children }, lead.value.children))

    return parts.join(', ')
})

const tourPrice = computed(() => {
    const amount = lead.value?.price_amount

    if (!amount) return ''

    return formatMoney({ amount, currency: (lead.value?.price_currency || 'USD') as Money['currency'] }, locale.value)
})

const KNOWN = new Set([
    'hotel_name', 'supplier_name', 'check_in', 'nights', 'adults', 'children',
    'price_amount', 'price_currency', 'route_from', 'route_to',
    'booking_url', 'hotel_url', 'hotel_stars', 'meal_name', 'room_name', 'kid_ages', 'route_to_label',
])

const plain = (value: unknown): string =>
    String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const extras = computed(() =>
    Object.entries(lead.value?.trip ?? {})
        .filter(([key, value]) => !KNOWN.has(key) && value !== null && value !== '' && value !== undefined)
        .map(([key, value]) => ({ key, value: plain(value) }))
        .filter(entry => entry.value))

useSeoMeta({ title: () => t('cms.leads.title'), robots: 'noindex, nofollow' })

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
