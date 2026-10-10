<template>
    <div class="tm-cms-orders">
        <SectionHead
            :level="1"
            :title="archived ? t('cms.archive.ordersTitle') : t('cms.orders.title')"
            :sub="archived ? t('cms.archive.ordersLead') : t('cms.orders.lead', counts)"
        />

        <div class="tm-cms-orders__bar">
            <Tabs v-if="!archived" v-model="tab" :items="tabs" variant="segment" :aria-label="t('cms.orders.title')" />

            <SearchField
                v-model="query"
                :label="t('cms.orders.search')"
                :placeholder="t('cms.orders.searchPlaceholder')"
                icon="search"
                clearable
                class="tm-cms-orders__search"
            />

            <SelectMenu v-if="elevated && !archived" v-model="person" :options="personOptions" class="tm-cms-orders__person" />
            <SelectMenu v-model="filter" :options="filterOptions" align="right" class="tm-cms-orders__filter" />
        </div>

        <EditorSkeleton v-if="status === 'pending' && !orders.length" variant="rows" />

        <p v-else-if="!orders?.length" class="tm-cms-orders__empty">
            {{ archived ? t('cms.archive.empty') : query || filter ? t('cms.orders.noMatches') : t('cms.orders.empty') }}
        </p>

        <table v-else class="tm-cms-orders__table">
            <thead>
                <tr>
                    <th scope="col" class="is-order"><span class="tm-cms-orders__head">{{ t('cms.orders.columns.order') }}</span></th>
                    <th scope="col" class="is-tour"><span class="tm-cms-orders__head">{{ t('cms.leads.list.tour') }}</span></th>
                    <th scope="col" class="is-price"><span class="tm-cms-orders__head">{{ t('cms.orders.columns.sum') }}</span></th>
                    <th scope="col" class="is-status"><span class="tm-cms-orders__head">{{ t('cms.orders.columns.status') }}</span></th>
                    <th scope="col" class="is-owner"><span class="tm-cms-orders__head">{{ t('cms.ownership.column') }}</span></th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="order in orders" :key="order.uuid"
                    class="tm-cms-orders__row" tabindex="0"
                    @click="go(order)"
                    @keydown.enter="go(order)"
                >
                    <td class="is-order">
                        <span class="tm-cms-orders__name">{{ order.traveller_name || '—' }}</span>
                        <span class="tm-cms-orders__meta">
                            <span class="tm-cms-orders__ref">{{ order.ref }}</span>
                            <template v-if="order.country"> · {{ order.country }}</template>
                            <template v-if="order.supplier_order_id"> · {{ order.supplier_order_id }}</template>
                        </span>
                    </td>

                    <td class="is-tour">
                        <template v-if="order.hotel_name">
                            <span class="tm-cms-orders__name is-plain">{{ order.hotel_name }}</span>
                            <span class="tm-cms-orders__line">{{ tripOf(order) }}</span>
                        </template>
                        <span v-else class="tm-cms-orders__line is-faint">—</span>
                    </td>

                    <td class="is-price">
                        <span class="tm-cms-orders__price">{{ money(order) }}</span>
                        <PaymentBadge :status="order.payment_status ?? 'unpaid'" class="tm-cms-orders__payment" />
                    </td>

                    <td class="is-status">
                        <span class="tm-cms-orders__status" :class="`is-${order.status}`">
                            {{ t(`cms.orders.status.${order.status}`) }}
                        </span>
                    </td>

                    <td class="is-owner">
                        <span v-if="order.manager_id" class="tm-cms-orders__owner" :class="{ 'is-me': order.manager_id === me }">
                            <span class="tm-cms-orders__avatar" aria-hidden="true">{{ initials(order.manager_name) }}</span>
                            <span class="tm-cms-orders__owner-name">{{ order.manager_id === me ? t('cms.ownership.you') : order.manager_name || '—' }}</span>
                        </span>
                        <span v-else class="tm-cms-orders__line is-faint">{{ t('cms.orders.queues.none') }}</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <Pagination
            :page="page" :pages="pages" :total="total" :per-page="perPage"
            @update:page="setPage" @update:per-page="setPerPage"
        />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import Pagination from '~/shared/components/pagination/Pagination.vue'
import PaymentBadge from '~/modules/finance/components/paymentBadge/PaymentBadge.vue'
import Tabs from '~/shared/components/tabs/Tabs.vue'
import { useOrders } from './Orders.hooks'
import type { IOrderRaw } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const {
  orders, status, query, filter, filterOptions, counts, archived,
  elevated, me, tab, tabs, person, personOptions,
  page, pages, total, perPage, setPage, setPerPage,
} = useOrders()

const initials = (name: string) => name.split(/\s+/).map(part => part[0] ?? '').join('').slice(0, 2).toUpperCase() || '—'

const tripOf = (order: IOrderRaw): string => {
    const guests = order.adults + order.children

    return [
        order.check_in ? shortDate(order.check_in) : '',
        order.nights ? t('search.nights', { n: order.nights }, order.nights) : '',
        guests ? t('cms.leads.list.guests', { n: guests }, guests) : '',
    ].filter(Boolean).join(' · ')
}

const go = (order: IOrderRaw) => navigateTo(localePath(`/app/orders/${order.uuid}`))

const shortDate = (value: string): string =>
    new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: 'short' }).format(new Date(value))

const money = (order: IOrderRaw): string => {
    if (order.price_amount === null) return '—'

    return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: order.price_currency || 'USD',
        maximumFractionDigits: 0,
    }).format(order.price_amount)
}

useSeoMeta({ title: () => t('cms.orders.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_orders.scss';
</style>
