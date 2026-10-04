<template>
    <div class="tm-my-order">
        <NuxtLink :to="localePath('/account')" class="tm-my-order__back">
            <Icon name="chevron-left" :size="16" />{{ t('account.order.back') }}
        </NuxtLink>

        <div v-if="status === 'pending'" class="tm-my-order__state">
            <Spinner />
        </div>

        <div v-else-if="!order" class="tm-my-order__missing">
            <h1 class="tm-my-order__missing-title">{{ t('account.order.missingTitle') }}</h1>
            <p class="tm-my-order__missing-text">{{ t('account.order.missingText') }}</p>
        </div>

        <template v-else>
            <header class="tm-my-order__head">
                <div>
                    <p class="tm-my-order__no">{{ t('account.order.number', { n: order.ref }) }}</p>
                    <h1 class="tm-my-order__title">
                        {{ order.hotel_name || order.country || t('account.orders.untitled') }}
                    </h1>
                    <p v-if="order.hotel_name && order.country" class="tm-my-order__sub">{{ order.country }}</p>
                </div>

                <OrderStatusPill :status="order.status" />
            </header>

            <p class="tm-my-order__hint">{{ t(`account.statusHint.${order.status}`) }}</p>

            <div class="tm-my-order__grid">
                <section class="tm-my-order__card">
                    <h2 class="tm-my-order__card-title">{{ t('account.order.trip') }}</h2>

                    <dl class="tm-my-order__rows">
                        <div><dt>{{ t('account.orders.dates') }}</dt><dd>{{ span(order.check_in, order.return_date) }}</dd></div>
                        <div v-if="order.nights"><dt>{{ t('account.order.nights') }}</dt><dd>{{ order.nights }}</dd></div>
                        <div><dt>{{ t('account.orders.travellers') }}</dt><dd>{{ travellers(order) }}</dd></div>
                        <div v-if="order.supplier_name"><dt>{{ t('account.order.operator') }}</dt><dd>{{ order.supplier_name }}</dd></div>
                        <div v-if="order.supplier_order_id"><dt>{{ t('account.order.booking') }}</dt><dd>{{ order.supplier_order_id }}</dd></div>
                        <div><dt>{{ t('account.orders.price') }}</dt><dd class="is-strong">{{ price(order) }}</dd></div>
                    </dl>
                </section>

                <section class="tm-my-order__card">
                    <h2 class="tm-my-order__card-title">{{ t('account.order.manager') }}</h2>

                    <div v-if="order.manager" class="tm-my-order__person">
                        <span class="tm-my-order__person-avatar" aria-hidden="true">
                            <Icon name="user" :size="18" />
                        </span>
                        <div>
                            <strong class="tm-my-order__person-name">{{ order.manager.name }}</strong>
                            <span class="tm-my-order__person-role">{{ t('account.order.managerRole') }}</span>
                        </div>
                    </div>

                    <p v-else class="tm-my-order__muted">{{ t('account.order.noManager') }}</p>

                    <p class="tm-my-order__contact">
                        {{ t('account.order.contactLead') }}
                        <NuxtLink :to="localePath('/contact')">{{ t('account.order.contactLink') }}</NuxtLink>
                    </p>
                </section>
            </div>

            <section class="tm-my-order__card">
                <h2 class="tm-my-order__card-title">{{ t('account.order.documents') }}</h2>

                <p v-if="!order.documents.length" class="tm-my-order__muted">{{ t('account.order.noDocuments') }}</p>

                <ul v-else class="tm-my-order__docs">
                    <li v-for="document in order.documents" :key="document.id" class="tm-my-order__doc">
                        <span class="tm-my-order__doc-icon" aria-hidden="true"><Icon name="doc" :size="18" /></span>

                        <div class="tm-my-order__doc-text">
                            <a :href="document.url" target="_blank" rel="noopener" class="tm-my-order__doc-name">
                                {{ document.name }}
                            </a>
                            <span class="tm-my-order__doc-meta">
                                {{ t(`account.documentKinds.${document.kind}`) }} · {{ weight(document.size) }} · {{ day(document.created_at) }}
                            </span>
                        </div>

                        <Button size="sm" variant="ghost" :href="document.url" target="_blank" rel="noopener">
                            {{ t('account.order.download') }}
                        </Button>
                    </li>
                </ul>
            </section>

            <section class="tm-my-order__card">
                <h2 class="tm-my-order__card-title">{{ t('account.order.history') }}</h2>

                <ol v-if="history.length" class="tm-my-order__events">
                    <li v-for="(event, i) in history" :key="i" class="tm-my-order__event" :class="{ 'is-current': i === 0 }">
                        <span class="tm-my-order__event-dot" aria-hidden="true" />
                        <div>
                            <strong class="tm-my-order__event-status">{{ t(`account.status.${event.to}`) }}</strong>
                            <span class="tm-my-order__event-when">{{ moment(event.at) }}</span>
                        </div>
                    </li>
                </ol>

                <p v-else class="tm-my-order__muted">{{ t('account.order.noHistory') }}</p>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import Icon from '~/shared/components/icon/Icon.vue'
import Spinner from '~/shared/components/spinner/Spinner.vue'
import OrderStatusPill from '~/modules/account/components/orderStatusPill/OrderStatusPill.vue'
import { useOrderWords } from '~/modules/account/hooks/use-order-words'
import { useCustomerOrder } from './Order.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { order, status, history } = useCustomerOrder()
const { day, moment, span, travellers, price } = useOrderWords()

const weight = (bytes: number): string =>
    bytes >= 1024 * 1024
        ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`

useSeoMeta({
  title: () => (order.value ? t('account.order.seoTitle', { n: order.value.ref }) : t('account.orders.seoTitle')),
  robots: 'noindex, nofollow',
})
</script>

<style lang="scss">
@use './_order.scss';
</style>
