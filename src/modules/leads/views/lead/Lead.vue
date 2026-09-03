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
                        {{ t(`cms.leads.channels.${lead.channel}`) }} · {{ fullDate(lead.created_at) }}
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

            <section class="tm-cms-lead__card">
                <h2 class="tm-cms-lead__card-title">{{ t('cms.leads.sections.offer') }}</h2>

                <p class="tm-cms-lead__offer-lead">{{ t('cms.leads.offer.lead') }}</p>

                <div class="tm-cms-lead__offer-links">
                    <Button
                        v-if="links.search"
                        size="sm" variant="secondary" icon="search"
                        :to="links.search"
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
                            <span class="tm-cms-lead__order-no">#{{ order.order_no }}</span>

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
import type { LeadStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const commentId = useId()
const reasonId = useId()

const {
    lead, draft, orders, status, error, saving, saved,
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
</script>

<style lang="scss">
@use './_lead.scss';
</style>
