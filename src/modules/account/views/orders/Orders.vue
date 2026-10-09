<template>
    <div class="tm-my-orders">
        <header class="tm-my-orders__head">
            <h1 class="tm-my-orders__title">{{ t('account.orders.title') }}</h1>
            <p class="tm-my-orders__lead">{{ t('account.orders.lead') }}</p>
        </header>

        <section v-if="requests.length" class="tm-my-orders__requests">
            <h2 class="tm-my-orders__section">{{ t('account.requests.title') }}</h2>

            <ul class="tm-my-orders__request-list">
                <li v-for="request in requests" :key="request.uuid" class="tm-my-orders__request">
                    <span class="tm-my-orders__request-icon" aria-hidden="true"><Icon name="inbox" :size="18" /></span>
                    <div class="tm-my-orders__request-main">
                        <strong>{{ request.hotel_name || request.destination || t('account.requests.untitled') }}</strong>
                        <span>{{ request.ref }} · {{ day(request.created_at) }}</span>
                    </div>
                    <span class="tm-my-orders__request-status" :class="`is-${request.status}`">{{ t(`account.requests.status.${request.status}`) }}</span>
                </li>
            </ul>
        </section>

        <h2 v-if="requests.length && orders.length" class="tm-my-orders__section">{{ t('account.orders.section') }}</h2>

        <div v-if="status === 'pending'" class="tm-my-orders__state">
            <Spinner />
        </div>

        <div v-else-if="!orders.length && !requests.length" class="tm-my-orders__empty">
            <Icon name="briefcase" :size="28" />
            <h2 class="tm-my-orders__empty-title">{{ t('account.orders.emptyTitle') }}</h2>
            <p class="tm-my-orders__empty-text">{{ t('account.orders.emptyText') }}</p>
            <Button to="/search" icon="search">{{ t('account.orders.findTour') }}</Button>
        </div>

        <ul v-else class="tm-my-orders__list">
            <li v-for="order in orders" :key="order.uuid">
                <NuxtLink :to="localePath(`/account/orders/${order.uuid}`)" class="tm-my-orders__card">
                    <div class="tm-my-orders__card-top">
                        <span class="tm-my-orders__no">{{ order.ref }}</span>
                        <OrderStatusPill :status="order.status" />
                    </div>

                    <h2 class="tm-my-orders__where">
                        {{ order.hotel_name || order.country || t('account.orders.untitled') }}
                    </h2>

                    <p v-if="order.hotel_name && order.country" class="tm-my-orders__country">{{ order.country }}</p>

                    <dl class="tm-my-orders__facts">
                        <div>
                            <dt>{{ t('account.orders.dates') }}</dt>
                            <dd>{{ span(order.check_in, order.return_date) }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('account.orders.travellers') }}</dt>
                            <dd>{{ travellers(order) }}</dd>
                        </div>
                        <div>
                            <dt>{{ t('account.orders.price') }}</dt>
                            <dd>{{ order.total_uzs ? sum(order.total_uzs) : price(order) }}</dd>
                        </div>
                    </dl>

                    <span class="tm-my-orders__more">
                        {{ t('account.orders.open') }} <Icon name="arrow-right" :size="14" />
                    </span>
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import Icon from '~/shared/components/icon/Icon.vue'
import Spinner from '~/shared/components/spinner/Spinner.vue'
import OrderStatusPill from '~/modules/account/components/orderStatusPill/OrderStatusPill.vue'
import { useOrderWords } from '~/modules/account/hooks/use-order-words'
import { useCustomerOrders } from './Orders.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { orders, requests, status } = useCustomerOrders()

const { locale } = useI18n()

const sum = (value: number) => `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)} ${t('cms.finance.sum')}`

const day = (value: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(new Date(value))
const { span, travellers, price } = useOrderWords()

useSeoMeta({ title: () => t('account.orders.seoTitle'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_orders.scss';
</style>
