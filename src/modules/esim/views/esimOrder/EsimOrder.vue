<template>
    <div class="tm-esim-order container-wide">
        <EditorSkeleton v-if="!order && !missing" variant="rows" />

        <section v-else-if="missing || !order" class="tm-esim-order__card is-center">
            <h1 class="tm-esim-order__title">{{ t('esim.order.missing') }}</h1>
            <Button :to="localePath('/esim')" variant="secondary">{{ t('esim.allCountries') }}</Button>
        </section>

        <template v-else>
            <p class="tm-esim-order__ref">{{ t('esim.order.ref', { number: order.number }) }} · {{ summary }} · {{ price }}</p>

            <section v-if="order.status === 'awaiting_payment'" class="tm-esim-order__card is-center">
                <span class="tm-esim-order__pulse" aria-hidden="true" />
                <h1 class="tm-esim-order__title">{{ t('esim.order.awaiting') }}</h1>
                <Button v-if="order.pay_url" :href="order.pay_url" size="lg">{{ t('esim.order.toPayment') }}</Button>
            </section>

            <section v-else-if="order.status === 'paid'" class="tm-esim-order__card is-center">
                <span class="tm-esim-order__pulse is-ok" aria-hidden="true" />
                <h1 class="tm-esim-order__title">{{ t('esim.order.issuing') }}</h1>
                <p class="tm-esim-order__text">{{ t('esim.order.issuingText') }}</p>
            </section>

            <section v-else-if="order.status === 'issue_failed'" class="tm-esim-order__card is-center">
                <h1 class="tm-esim-order__title">{{ t('esim.order.failed') }}</h1>
                <p class="tm-esim-order__text">{{ t('esim.order.failedText') }}</p>
                <Button :to="localePath('/contact')" variant="secondary">{{ t('esim.order.support') }}</Button>
            </section>

            <section v-else-if="order.status === 'cancelled'" class="tm-esim-order__card is-center">
                <h1 class="tm-esim-order__title">{{ t('esim.order.cancelled') }}</h1>
                <Button :to="localePath(`/esim/${order.country.toLowerCase()}`)" size="lg">{{ t('esim.order.again') }}</Button>
            </section>

            <section v-else-if="order.esim" class="tm-esim-order__ready">
                <div class="tm-esim-order__card tm-esim-order__qr-card">
                    <span class="tm-esim-order__badge"><Icon name="check" :size="14" /> {{ t('esim.order.ready') }}</span>
                    <h1 class="tm-esim-order__title">{{ t('esim.order.scan') }}</h1>
                    <div class="tm-esim-order__qr" role="img" :aria-label="t('esim.order.qrLabel')" v-html="qr" />
                    <p class="tm-esim-order__text">{{ t('esim.order.keep') }}</p>
                </div>

                <div class="tm-esim-order__card">
                    <Tabs
                        v-model="device"
                        :items="[{ value: 'ios', label: 'iPhone' }, { value: 'android', label: 'Android' }]"
                        variant="segment"
                        :aria-label="t('esim.order.howTo')"
                    />

                    <ol class="tm-esim-order__steps">
                        <li v-for="step in 4" :key="step">{{ t(`esim.install.${device}.${step}`) }}</li>
                    </ol>

                    <h2 class="tm-esim-order__subtitle">{{ t('esim.order.manual') }}</h2>

                    <dl class="tm-esim-order__codes">
                        <div>
                            <dt>{{ t('esim.order.smdp') }}</dt>
                            <dd>
                                <code>{{ order.esim.smdp }}</code>
                                <button type="button" class="tm-esim-order__copy" @click="copy(order.esim.smdp)">
                                    <Icon name="copy" :size="14" /> {{ t('esim.order.copy') }}
                                </button>
                            </dd>
                        </div>
                        <div>
                            <dt>{{ t('esim.order.code') }}</dt>
                            <dd>
                                <code>{{ order.esim.activationCode }}</code>
                                <button type="button" class="tm-esim-order__copy" @click="copy(order.esim.activationCode)">
                                    <Icon name="copy" :size="14" /> {{ t('esim.order.copy') }}
                                </button>
                            </dd>
                        </div>
                        <div v-if="order.esim.apn">
                            <dt>APN</dt>
                            <dd><code>{{ order.esim.apn }}</code></dd>
                        </div>
                        <div>
                            <dt>ICCID</dt>
                            <dd><code>{{ order.esim.iccid }}</code></dd>
                        </div>
                    </dl>
                </div>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import { useEsimOrder } from './EsimOrder.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { order, missing, qr, summary, price, device, copy } = useEsimOrder()

useSeoMeta({ title: () => t('esim.order.seo'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_esim-order.scss';
</style>
