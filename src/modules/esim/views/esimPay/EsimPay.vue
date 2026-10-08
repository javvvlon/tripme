<template>
    <div class="tm-esim-pay container-wide">
        <div class="tm-esim-pay__frame">
            <p class="tm-esim-pay__sandbox">{{ t('esim.pay.sandbox') }}</p>

            <header class="tm-esim-pay__head">
                <span class="tm-esim-pay__gateway" :class="`is-${method}`">{{ t(`esim.methods.${method}`) }}</span>
                <span class="tm-esim-pay__merchant">TripMe · {{ order ? t('esim.order.ref', { number: order.number }) : '' }}</span>
                <strong class="tm-esim-pay__amount">{{ amount }}</strong>
            </header>

            <form v-if="method === 'card' && step === 'details'" class="tm-esim-pay__form" @submit.prevent="submitCard">
                <Input v-model="card.number" inputmode="numeric" autocomplete="off" :label="t('esim.pay.cardNumber')" />
                <div class="tm-esim-pay__row">
                    <Input v-model="card.expiry" inputmode="numeric" autocomplete="off" :label="t('esim.pay.expiry')" placeholder="MM/YY" />
                    <Input v-model="card.cvc" inputmode="numeric" autocomplete="off" :label="t('esim.pay.cvc')" />
                </div>
                <Button type="submit" size="lg" :disabled="!cardValid">{{ t('esim.pay.payAmount', { amount }) }}</Button>
            </form>

            <form v-else-if="method === 'card'" class="tm-esim-pay__form" @submit.prevent="submitCode">
                <div class="tm-esim-pay__secure">
                    <Icon name="shield" :size="22" />
                    <div>
                        <strong>{{ t('esim.pay.secureTitle') }}</strong>
                        <p>{{ t('esim.pay.secureText', { card: `•••• ${card.number.replace(/\D/g, '').slice(-4)}` }) }}</p>
                    </div>
                </div>
                <Input v-model="code" inputmode="numeric" autocomplete="one-time-code" :label="t('esim.pay.code')" :hint="t('esim.pay.codeHint')" />
                <Button type="submit" size="lg" :disabled="busy || code.length !== 6">{{ t('esim.pay.confirm') }}</Button>
            </form>

            <div v-else class="tm-esim-pay__form">
                <Button type="button" size="lg" :disabled="busy" @click="finish('paid')">{{ t('esim.pay.payAmount', { amount }) }}</Button>
            </div>

            <button type="button" class="tm-esim-pay__cancel" :disabled="busy" @click="finish('failed')">
                {{ t('esim.pay.cancel') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useEsimPay } from './EsimPay.hooks'

const { t } = useI18n()

const { order, step, busy, card, code, amount, method, cardValid, finish, submitCard, submitCode } = useEsimPay()

useSeoMeta({ title: () => t('esim.pay.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_esim-pay.scss';
</style>
