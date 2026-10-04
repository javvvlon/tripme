<template>
    <div class="tm-my-orders">
        <header class="tm-my-orders__head">
            <h1 class="tm-my-orders__title">{{ t('account.orders.title') }}</h1>
            <p class="tm-my-orders__lead">{{ t('account.orders.lead') }}</p>
        </header>

        <div v-if="status === 'pending'" class="tm-my-orders__state">
            <Spinner />
        </div>

        <div v-else-if="!orders.length" class="tm-my-orders__empty">
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
                            <dd>{{ price(order) }}</dd>
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

const { orders, status } = useCustomerOrders()
const { span, travellers, price } = useOrderWords()

useSeoMeta({ title: () => t('account.orders.seoTitle'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_orders.scss';
</style>
