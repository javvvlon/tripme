<template>
    <div class="tm-cms-orders">
        <SectionHead
            :level="1"
            :title="t('cms.orders.title')"
            :sub="t('cms.orders.lead', counts)"
        />


        <div class="tm-cms-orders__actions">
            <SearchField
                v-model="query"
                :label="t('cms.orders.search')"
                :placeholder="t('cms.orders.searchPlaceholder')"
                icon="search"
                clearable
                class="tm-cms-orders__search"
            />

            <SelectMenu
                v-model="managerFilter"
                :options="managerOptions"
                class="tm-cms-orders__owner"
            />
            <SelectMenu v-model="filter" :options="filterOptions" align="right" />
        </div>

        <EditorSkeleton v-if="status === 'pending' && !orders.length" variant="rows" />

        <p v-else-if="!orders?.length" class="tm-cms-orders__empty">
            {{ query || filter ? t('cms.orders.noMatches') : t('cms.orders.empty') }}
        </p>

        <table v-else class="tm-cms-orders__table">
            <thead>
                <tr>
                    <th scope="col" class="is-num is-no">{{ t('cms.orders.columns.number') }}</th>
                    <th scope="col">{{ t('cms.orders.columns.traveller') }}</th>
                    <th scope="col">{{ t('cms.orders.columns.trip') }}</th>
                    <th scope="col" class="is-date">{{ t('cms.orders.columns.departure') }}</th>
                    <th scope="col" class="is-num is-party">{{ t('cms.orders.columns.party') }}</th>
                    <th scope="col" class="is-num is-price">{{ t('cms.orders.columns.price') }}</th>
                    <th scope="col" class="is-ref">{{ t('cms.orders.columns.supplierOrder') }}</th>
                    <th scope="col" class="is-owner">{{ t('cms.ownership.column') }}</th>
                    <th scope="col" class="is-status">{{ t('cms.orders.columns.status') }}</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="order in orders" :key="order.uuid"
                    class="tm-cms-orders__row" tabindex="0"
                    @click="go(order)"
                    @keydown.enter="go(order)"
                >
                    <td class="is-num tm-cms-orders__no">{{ order.ref }}</td>
                    <td class="tm-cms-orders__strong">{{ order.traveller_name || '—' }}</td>

                    <td class="tm-cms-orders__truncate">
                        {{ [order.country, order.hotel_name].filter(Boolean).join(' · ') || '—' }}
                    </td>

                    <td class="is-muted">{{ order.check_in ? `${shortDate(order.check_in)} · ${order.nights}` : '—' }}</td>
                    <td class="is-num">{{ order.adults }}<template v-if="order.children">+{{ order.children }}</template></td>
                    <td class="is-num">{{ money(order) }}</td>
                    <td class="is-muted tm-cms-orders__truncate">{{ order.supplier_order_id || '—' }}</td>
                    <td class="is-owner tm-cms-orders__truncate">
                        {{ order.manager_id === me ? t('cms.ownership.you') : order.manager_name || '—' }}
                    </td>

                    <td class="is-status">
                        <span class="tm-cms-orders__status" :class="`is-${order.status}`">
                            {{ t(`cms.orders.status.${order.status}`) }}
                        </span>
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
import { useOrders } from './Orders.hooks'
import type { IOrderRaw } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const {
  orders, status, error, query, filter, filterOptions, counts,
  managerFilter, managerOptions, me,
  page, pages, total, perPage, setPage, setPerPage,
} = useOrders()

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
