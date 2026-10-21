<template>
    <div class="tm-cms-lead">
        <NuxtLink :to="localePath('/app/leads')" class="tm-cms-lead__back" :aria-label="t('cms.leads.backToList')">
            <Icon name="chevron-left" :size="18" />{{ t('cms.leads.title') }}
        </NuxtLink>

        <EditorSkeleton v-if="status === 'pending'" variant="form" />

        <p v-else-if="!lead" class="tm-cms-lead__empty">{{ t('cms.leads.missing') }}</p>

        <template v-else>
            <header class="tm-cms-lead__head">
                <div class="tm-cms-lead__heading">
                    <h1 class="tm-cms-lead__number">{{ lead.ref }}</h1>
                    <p class="tm-cms-lead__sub">
                        <strong v-if="clientName">{{ clientName }}</strong>
                        <span>{{ t(`cms.leads.channels.${lead.channel}`) }}</span>
                        <span>{{ fullDate(lead.created_at) }}</span>
                        <span v-if="lead.user_id">{{ t('cms.leads.registered') }}</span>
                    </p>
                    <p v-if="lead.consent_at" class="tm-cms-lead__compliance">
                        <Icon name="shield" :size="14" />
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

                    <ChatButton v-if="lead.user_id" :client-id="lead.user_id" :client-name="clientName" />
                    <MoreMenu v-if="!lead.archived_at" :label="t('cms.more')" :items="moreItems" @select="onMore" />
                </div>
            </header>

            <section v-if="lead.archived_at" class="tm-cms-archived" role="status">
                <Icon name="folder" :size="18" />
                <span>{{ t('cms.archive.leadSince', { date: fullDate(lead.archived_at) }) }}</span>
                <Button type="button" size="sm" variant="secondary" icon="undo" @click="restore">{{ t('cms.archive.restore') }}</Button>
            </section>

            <p v-if="saved" class="tm-cms-lead__saved" role="status">{{ t('cms.saved') }}</p>

            <LeadOwner v-if="lead.manager_id !== me" :lead="lead" @changed="owned" />

            <Tabs v-model="tab" :items="tabItems" variant="segment" :aria-label="lead.ref" class="tm-cms-lead__tabs" />

            <div v-show="tab === 'tour'" class="tm-cms-lead__pane">
                <section v-if="finished && !pickingEsim" class="tm-cms-lead__outcome" :class="`is-${outcome.tone}`" role="status">
                    <span class="tm-cms-lead__outcome-glyph"><Icon :name="outcome.tone === 'won' ? 'check' : 'close'" :size="18" /></span>

                    <span class="tm-cms-lead__outcome-text">
                        <strong>{{ outcome.title }}</strong>
                        <span v-if="outcome.note">{{ outcome.note }}</span>
                    </span>

                    <Button type="button" size="sm" :variant="outcome.tone === 'won' ? 'tinted' : 'secondary'" icon="plus" :loading="requesting" @click="startRequest">
                        {{ t('cms.leads.next.action') }}
                    </Button>
                </section>

                <section class="tm-cms-lead__group">
                    <header class="tm-cms-lead__group-head">
                        <h2>{{ t('cms.leads.sections.offer') }}</h2>

                        <div v-if="hasTour && !pickingEsim && !finished" class="tm-cms-lead__group-actions">
                            <ServiceMenu
                                :label="t('cms.leads.offer.replace')" variant="ghost"
                                :esim="esimAvailable" :disabled="saving"
                                @select="chooseService"
                            />

                            <Button
                                type="button" size="sm" variant="danger-quiet" icon="trash"
                                :disabled="saving"
                                @click="clearTour"
                            >
                                {{ t('cms.leads.offer.clear') }}
                            </Button>
                        </div>
                    </header>

                    <div class="tm-cms-lead__list">
                        <div v-if="pickingEsim" class="tm-cms-lead__inset">
                            <EsimPicker :initial-country="isEsim ? String(lead.trip.esim_country ?? '') : ''" @pick="assignEsim" />

                            <div class="tm-cms-lead__inset-foot">
                                <Button type="button" size="sm" variant="ghost" :disabled="saving" @click="pickingEsim = false">
                                    {{ t('common.cancel') }}
                                </Button>
                            </div>
                        </div>

                        <template v-else-if="hasTour">
                            <div class="tm-cms-lead__item is-tour">
                                <span class="tm-cms-lead__glyph is-large"><Icon :name="isEsim ? 'sim' : 'briefcase'" :size="20" /></span>

                                <span class="tm-cms-lead__item-main">
                                    <span class="tm-cms-lead__tour-name">
                                        {{ lead.hotel_name }}
                                        <span v-if="stars" class="tm-cms-lead__tour-stars" :aria-label="`${stars}★`">{{ '★'.repeat(stars) }}</span>
                                    </span>
                                    <span v-if="tourMeta" class="tm-cms-lead__item-sub">{{ tourMeta }}</span>
                                    <span class="tm-cms-lead__item-sub">
                                        <template v-if="lead.check_in">{{ formatDateRange(lead.check_in, lead.nights, locale) }} · </template>{{ party }}
                                    </span>
                                </span>

                                <span v-if="tourPrice" class="tm-cms-lead__tour-price">{{ tourPrice }}</span>
                            </div>

                            <NuxtLink v-if="!isEsim" :to="pickToursLink" class="tm-cms-lead__item is-nav">
                                <span class="tm-cms-lead__glyph"><Icon name="search" :size="15" /></span>
                                <span class="tm-cms-lead__item-main">{{ t('cms.leads.offer.repeatSearch') }}</span>
                                <Icon name="chevron-right" :size="16" class="tm-cms-lead__chevron" />
                            </NuxtLink>

                            <a v-if="links.booking" :href="links.booking" target="_blank" rel="noopener" class="tm-cms-lead__item is-nav">
                                <span class="tm-cms-lead__glyph"><Icon name="briefcase" :size="15" /></span>
                                <span class="tm-cms-lead__item-main">{{ t('cms.leads.openAtOperator') }}</span>
                                <Icon name="arrow-up-right" :size="15" class="tm-cms-lead__chevron" />
                            </a>

                            <a v-if="links.hotel" :href="links.hotel" target="_blank" rel="noopener" class="tm-cms-lead__item is-nav">
                                <span class="tm-cms-lead__glyph"><Icon name="bed" :size="15" /></span>
                                <span class="tm-cms-lead__item-main">{{ t('cms.leads.openHotelPage') }}</span>
                                <Icon name="arrow-up-right" :size="15" class="tm-cms-lead__chevron" />
                            </a>
                        </template>

                        <div v-else-if="!finished" class="tm-cms-lead__blank">
                            <span class="tm-cms-lead__glyph is-large"><Icon name="briefcase" :size="22" /></span>
                            <p class="tm-cms-lead__blank-title">{{ t('cms.leads.offer.empty') }}</p>
                            <blockquote v-if="lead.comment" class="tm-cms-lead__quote">{{ lead.comment }}</blockquote>
                            <ServiceMenu :label="t('cms.leads.offer.add')" :esim="esimAvailable" @select="chooseService" />
                        </div>
                    </div>

                    <div v-if="hasTour && !pickingEsim && canQuote" class="tm-cms-lead__group-cta">
                        <Button type="button" icon="doc" @click="quoteOpen = true">
                            {{ t('cms.leads.offer.quote') }}
                        </Button>
                    </div>
                </section>

                <section v-if="extras.length" class="tm-cms-lead__group">
                    <header class="tm-cms-lead__group-head">
                        <h2>{{ t('cms.leads.sections.raw') }}</h2>
                    </header>

                    <div class="tm-cms-lead__panel">
                        <dl class="tm-cms-lead__raw">
                            <div v-for="entry in extras" :key="entry.key">
                                <dt>{{ entry.key }}</dt>
                                <dd>{{ entry.value }}</dd>
                            </div>
                        </dl>
                    </div>
                </section>
            </div>

            <div v-show="tab === 'request'" class="tm-cms-lead__pane">
                <CustomerPoints v-if="lead.user_id" :user-id="lead.user_id" class="tm-cms-lead__points" />

                <form class="tm-cms-lead__pane" novalidate @submit.prevent="submit">
                    <section class="tm-cms-lead__group">
                        <header class="tm-cms-lead__group-head">
                            <h2>{{ t('cms.leads.sections.client') }}</h2>
                            <span v-if="lead.account" class="tm-cms-lead__account">
                                <Icon name="user" :size="13" />{{ t('cms.leads.account') }}
                            </span>
                        </header>

                        <dl class="tm-cms-lead__list">
                            <div class="tm-cms-lead__item is-pair">
                                <dt>{{ t('cms.leads.columns.client') }}</dt>
                                <dd>{{ clientName || '—' }}</dd>
                            </div>
                            <div class="tm-cms-lead__item is-pair">
                                <dt>{{ t('cms.leads.columns.phone') }}</dt>
                                <dd><a :href="`tel:${lead.phone}`" class="tm-cms-lead__tint">{{ lead.phone }}</a></dd>
                            </div>
                            <div v-if="lead.account?.email" class="tm-cms-lead__item is-pair">
                                <dt>{{ t('cms.leads.columns.email') }}</dt>
                                <dd><a :href="`mailto:${lead.account.email}`" class="tm-cms-lead__tint">{{ lead.account.email }}</a></dd>
                            </div>
                            <div class="tm-cms-lead__item is-pair">
                                <dt>{{ t('cms.leads.columns.locale') }}</dt>
                                <dd>{{ lead.locale.toUpperCase() }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section v-if="related.length" class="tm-cms-lead__group">
                        <header class="tm-cms-lead__group-head">
                            <h2>{{ t('cms.leads.related.title') }}</h2>
                        </header>

                        <ul class="tm-cms-lead__list">
                            <li v-for="item in related" :key="item.uuid">
                                <component
                                    :is="item.visible ? NuxtLink : 'div'"
                                    :to="item.visible ? localePath(`/app/leads/${item.uuid}`) : undefined"
                                    class="tm-cms-lead__item"
                                    :class="item.visible ? 'is-nav' : 'is-locked'"
                                >
                                    <span class="tm-cms-lead__ref">{{ item.ref }}</span>
                                    <span class="tm-cms-lead__item-main">
                                        <span class="tm-cms-lead__item-title">{{ item.hotel_name || item.destination || t('cms.leads.related.noTour') }}</span>
                                        <span class="tm-cms-lead__item-sub">
                                            {{ shortDate(item.created_at) }}
                                            <template v-if="item.manager_name"> · {{ item.manager_name }}</template>
                                            <template v-for="order in item.orders" :key="order.ref"> · {{ order.ref }} {{ t(`cms.orders.status.${order.status}`).toLowerCase() }}</template>
                                        </span>
                                    </span>
                                    <span v-if="item.archived_at" class="tm-cms-lead__status is-archived">{{ t('cms.archive.badge') }}</span>
                                    <span class="tm-cms-lead__status" :class="`is-${item.status}`">{{ t(`cms.leads.status.${item.status}`) }}</span>
                                    <Icon v-if="item.visible" name="chevron-right" :size="16" class="tm-cms-lead__chevron" />
                                </component>
                            </li>
                        </ul>
                    </section>

                    <section class="tm-cms-lead__group">
                        <header class="tm-cms-lead__group-head">
                            <h2>{{ t('cms.leads.sections.request') }}</h2>
                        </header>

                        <div class="tm-cms-lead__panel">
                            <div class="tm-cms-lead__fields">
                                <Input v-model="draft.destination" :label="t('cms.leads.fields.destination')" />
                                <Input
                                    v-model="draft.plannedDates"
                                    :label="t('cms.leads.fields.plannedDates')"
                                    :hint="t('cms.leads.fields.plannedDatesHint')"
                                />
                                <TravellersPicker v-model="draft.party" :label="t('cms.leads.fields.party')" variant="field" :max-adults="12" :max-kids="8" />
                            </div>

                            <div class="tm-cms-lead__fields">
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
                                <SelectMenu v-model="draft.rejectReason" :options="reasonOptions" :label="t('cms.leads.fields.rejectReason')" :placeholder="legacyReason || t('cms.leads.reject.pick')" />
                            </div>
                        </div>
                    </section>

                    <footer class="tm-cms-lead__foot">
                        <Button type="submit" :disabled="saving">
                            {{ saving ? t('cms.saving') : t('cms.save') }}
                        </Button>
                    </footer>
                </form>
            </div>

            <div v-show="tab === 'orders'" class="tm-cms-lead__pane">
                <section class="tm-cms-lead__group">
                    <header class="tm-cms-lead__group-head">
                        <h2>{{ t('cms.leads.sections.orders') }}</h2>

                        <Button
                            type="button" size="sm" variant="ghost" icon="plus"
                            :disabled="!hasTour"
                            :loading="creatingOrder"
                            :title="hasTour ? undefined : t('cms.leads.orderNeedsTour')"
                            @click="addOrder"
                        >
                            {{ t('cms.leads.addOrder') }}
                        </Button>
                    </header>

                    <div v-if="!orders.length" class="tm-cms-lead__list">
                        <p class="tm-cms-lead__item is-quiet">{{ t('cms.leads.noOrders') }}</p>
                    </div>

                    <ul v-else class="tm-cms-lead__list">
                        <li v-for="order in orders" :key="order.uuid">
                            <NuxtLink :to="localePath(`/app/orders/${order.uuid}`)" class="tm-cms-lead__item is-nav">
                                <span class="tm-cms-lead__ref">{{ order.ref }}</span>

                                <span class="tm-cms-lead__item-main">
                                    <span class="tm-cms-lead__item-title">{{ order.hotel_name || '—' }}</span>
                                    <span class="tm-cms-lead__item-sub">
                                        {{ order.check_in ? `${shortDate(order.check_in)} · ${order.nights}` : '—' }}
                                        <template v-if="order.supplier_name"> · {{ order.supplier_name }}</template>
                                    </span>
                                </span>

                                <span v-if="order.archived_at" class="tm-cms-lead__status is-archived">{{ t('cms.archive.badge') }}</span>
                                <span class="tm-cms-lead__status" :class="`is-${order.status}`">
                                    {{ t(`cms.orders.status.${order.status}`) }}
                                </span>
                                <Icon name="chevron-right" :size="16" class="tm-cms-lead__chevron" />
                            </NuxtLink>
                        </li>
                    </ul>
                </section>
            </div>

            <div v-show="tab === 'history'" class="tm-cms-lead__pane">
                <LeadHistory :lead-id="lead.uuid" :version="historyVersion" />
            </div>

            <ClientOnly>
                <QuoteModal
                    v-if="hasTour"
                    v-model="quoteOpen"
                    :tours="quoteTours"
                    :lead-id="lead.uuid"
                    :destination="quoteDestination"
                    :departure="quoteDeparture"
                    @marked="quoteMarked"
                />
            </ClientOnly>

            <Modal
                v-model="rejecting"
                :title="t('cms.leads.reject.title')"
                :confirm-label="t('cms.leads.reject.confirm')"
                :busy="saving"
                :disabled="!rejectPick"
                :error="rejecting ? error : ''"
                size="sm"
                tone="danger"
                @confirm="confirmReject"
            >
                <div class="tm-cms-lead__reasons" role="radiogroup" :aria-label="t('cms.leads.reject.title')">
                    <label v-for="option in reasonOptions" :key="option.value" class="tm-cms-lead__reason" :class="{ 'is-on': rejectPick === option.value }">
                        <input v-model="rejectPick" type="radio" name="reject-reason" :value="option.value">
                        <span>{{ option.label }}</span>
                        <Icon v-if="rejectPick === option.value" name="check" :size="16" class="tm-cms-lead__reason-check" />
                    </label>
                </div>
            </Modal>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import { useLead } from './Lead.hooks'
import { LEAD_TABS } from './Lead.config'
import type { LeadTab } from './Lead.config'
import Button from '~/shared/components/button/Button.vue'
import { formatDate } from '~/shared/helpers/format-date'
import PriceInput from '~/shared/components/priceInput/PriceInput.vue'
import CurrencySelect from '~/shared/components/currencySelect/CurrencySelect.vue'
import { offerLinks } from '~/modules/leads/helpers/offer'
import ServiceMenu from '~/modules/leads/components/serviceMenu/ServiceMenu.vue'
import EsimPicker from '~/modules/esim/components/esimPicker/EsimPicker.vue'
import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { useEsimMode } from '~/modules/esim/hooks/use-esim-mode'
import type { ServiceChoice } from '~/modules/leads/components/serviceMenu/ServiceMenu.d'
import { formatDateRange, formatMoney } from '~/shared/utils/format'
import CustomerPoints from '~/modules/points/components/customerPoints/CustomerPoints.vue'
import LeadOwner from '~/modules/leads/components/leadOwner/LeadOwner.vue'
import ChatButton from '~/modules/messages/components/chatButton/ChatButton.vue'
import MoreMenu from '~/shared/components/moreMenu/MoreMenu.vue'
import TravellersPicker from '~/shared/components/travellersPicker/TravellersPicker.vue'
import { NuxtLink } from '#components'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import LeadHistory from '~/modules/leads/components/leadHistory/LeadHistory.vue'
import QuoteModal from '~/modules/leads/components/quoteModal/QuoteModal.vue'
import { tourFromLead } from '~/modules/leads/helpers/quote'
import { isRejectReason, LEAD_TRANSITIONS } from '~/modules/leads/contracts/leads'
import type { ILeadRaw, LeadStatus } from '~/modules/leads/contracts/leads'
import type { Money } from '~/search_engine/contracts/search'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const commentId = useId()

const {
    lead, draft, orders, status, error, saving, saved,
    historyVersion, owned,
    statusOptions, change, submit, addOrder, archive, restore,
    rejecting, rejectPick, confirmReject, reasonOptions, legacyReason,
    pickingEsim, hasTour, assignEsim, clearTour,
    tripDone, finished, lastOrder, related, requesting, startRequest, creatingOrder,
} = useLead()

const { label } = useCatalogLabel()

const quoteOpen = ref(false)

const clientName = computed(() => [lead.value?.first_name, lead.value?.last_name].filter(Boolean).join(' '))

const isEsim = computed(() => lead.value?.trip.product === 'esim')

const { data: esimCountries } = useEsimCountries()

const { affiliate: esimAffiliate } = useEsimMode()

const esimAvailable = computed(() => esimCountries.value.length > 0 && !esimAffiliate.value)

const chooseService = (choice: ServiceChoice) => {
    if (choice === 'esim') pickingEsim.value = true
    else navigateTo(pickToursLink.value)
}

const canQuote = computed(() =>
    Boolean(lead.value) && !isEsim.value && !finished.value && (LEAD_TRANSITIONS[lead.value!.status] ?? []).includes('quote_sent'))

const quoteTours = computed(() => (lead.value && hasTour.value ? [tourFromLead(lead.value)] : []))

const quoteDestination = computed(() =>
    label(lead.value?.route_to || String(lead.value?.trip.route_to ?? '')) || lead.value?.destination || '')

const quoteDeparture = computed(() =>
    label(lead.value?.route_from || String(lead.value?.trip.route_from ?? ''), 'city'))

const quoteMarked = (found: ILeadRaw) => {
    lead.value = found
    historyVersion.value++
}

const outcome = computed(() => {
    const order = lastOrder.value

    if (tripDone.value && order) {
        return {
            tone: order.status === 'completed' ? 'won' : 'lost',
            title: t('cms.leads.next.doneWithOrder', { order: order.ref, status: t(`cms.orders.status.${order.status}`) }),
            note: '',
        }
    }

    const reason = draft.rejectReason

    return {
        tone: 'lost',
        title: t('cms.leads.next.doneRejected'),
        note: reason ? `${t('cms.leads.reject.title')}: ${isRejectReason(reason) ? t(`cms.leads.rejectReasons.${reason}`) : reason}` : '',
    }
})

const route = useRoute()
const router = useRouter()

const moreItems = computed(() => [
    { key: 'request', label: t('cms.leads.next.action'), icon: 'plus' },
    { key: 'archive', label: t('cms.archive.action'), icon: 'folder' },
])

const onMore = (key: string) => {
    if (key === 'archive') void archive()
    if (key === 'request') void startRequest()
}

const tab = computed<LeadTab>({
    get: () => {
        const wanted = route.query.tab as LeadTab

        return LEAD_TABS.includes(wanted) ? wanted : 'tour'
    },
    set: (next) => { void router.replace({ query: { ...route.query, tab: next === 'tour' ? undefined : next } }) },
})

const tabItems = computed(() => LEAD_TABS
    .map(value => ({
        value,
        label: value === 'orders' && orders.value.length ? `${t('cms.leads.tabs.orders')} · ${orders.value.length}` : t(`cms.leads.tabs.${value}`),
    })))

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
