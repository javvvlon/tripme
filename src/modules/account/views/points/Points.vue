<template>
    <div class="tm-my-points">
        <header class="tm-my-points__head">
            <h1 class="tm-my-points__title">{{ t('account.points.title') }}</h1>
            <p class="tm-my-points__lead">{{ t('account.points.lead') }}</p>
        </header>

        <div v-if="status === 'pending'" class="tm-my-points__state">
            <Spinner />
        </div>

        <template v-else-if="data">
            <section class="tm-my-points__hero">
                <div class="tm-my-points__balance">
                    <span class="tm-my-points__balance-label">{{ t('account.points.balance') }}</span>
                    <strong class="tm-my-points__balance-value">{{ points(data.summary.balance) }}</strong>
                    <span class="tm-my-points__balance-unit">{{ t('account.points.unit') }}</span>
                </div>

                <div class="tm-my-points__tier">
                    <TierBadge :tier="data.summary.tier" />

                    <p v-if="data.summary.tier" class="tm-my-points__discount">
                        {{ t('account.points.discount', { percent: data.summary.tier.discount_percent }) }}
                    </p>
                    <p v-else class="tm-my-points__discount">{{ t('account.points.noDiscount') }}</p>

                    <template v-if="data.summary.next">
                        <div class="tm-my-points__bar" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
                            <span class="tm-my-points__bar-fill" :style="{ width: `${progress}%` }" />
                        </div>
                        <p class="tm-my-points__next">
                            {{ t('account.points.next', { points: points(data.summary.to_next), tier: data.summary.next.name, percent: data.summary.next.discount_percent }) }}
                        </p>
                    </template>

                    <p v-else-if="data.summary.tier" class="tm-my-points__next">{{ t('account.points.top') }}</p>
                </div>
            </section>

            <section class="tm-my-points__card">
                <h2 class="tm-my-points__card-title">{{ t('account.points.how') }}</h2>
                <p class="tm-my-points__text">{{ t('account.points.howText') }}</p>

                <ol v-if="data.tiers.length" class="tm-my-points__ladder">
                    <li
                        v-for="tier in data.tiers" :key="tier.id"
                        class="tm-my-points__rung"
                        :class="{ 'is-reached': data.summary.balance >= tier.threshold }"
                    >
                        <TierBadge :tier="tier" />
                        <span class="tm-my-points__rung-threshold">{{ t('account.points.from', { points: points(tier.threshold) }) }}</span>
                        <span class="tm-my-points__rung-discount">−{{ tier.discount_percent }}%</span>
                    </li>
                </ol>
            </section>

            <section class="tm-my-points__card">
                <h2 class="tm-my-points__card-title">{{ t('account.points.history') }}</h2>

                <p v-if="!data.history.length" class="tm-my-points__text">{{ t('account.points.noHistory') }}</p>

                <ul v-else class="tm-my-points__list">
                    <li v-for="item in data.history" :key="item.id" class="tm-my-points__row">
                        <div class="tm-my-points__row-text">
                            <strong class="tm-my-points__row-title">
                                <template v-if="item.reason === 'order' && item.order_ref">
                                    {{ t('account.points.forOrder', { n: item.order_ref }) }}
                                </template>
                                <template v-else>{{ item.note || t('account.points.adjustment') }}</template>
                            </strong>
                            <span class="tm-my-points__row-when">{{ moment(item.created_at) }}</span>
                        </div>

                        <span class="tm-my-points__delta" :class="item.delta > 0 ? 'is-plus' : 'is-minus'">
                            {{ item.delta > 0 ? '+' : '−' }}{{ points(Math.abs(item.delta)) }}
                        </span>
                    </li>
                </ul>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import Spinner from '~/shared/components/spinner/Spinner.vue'
import TierBadge from '~/modules/points/components/tierBadge/TierBadge.vue'
import { useOrderWords } from '~/modules/account/hooks/use-order-words'
import { useMyPoints } from './Points.hooks'

const { t, locale } = useI18n()

const { data, status, progress } = useMyPoints()
const { moment } = useOrderWords()

const points = (value: number): string => value.toLocaleString(locale.value)

useSeoMeta({ title: () => t('account.points.seoTitle'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_points.scss';
</style>
