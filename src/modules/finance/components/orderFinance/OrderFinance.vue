<template>
    <section class="tm-finance">
        <header class="tm-finance__head">
            <h2 class="tm-finance__title">{{ t('cms.finance.title') }}</h2>
            <PaymentBadge v-if="finance" :status="finance.payment_status" />
        </header>

        <p v-if="loading && !finance" class="tm-finance__muted">{{ t('cms.loading') }}</p>

        <template v-else-if="finance">
            <dl class="tm-finance__totals">
                <div>
                    <dt>{{ t('cms.finance.total') }}</dt>
                    <dd class="is-strong">{{ sum(finance.total_uzs) }}</dd>
                </div>
                <div>
                    <dt>{{ t('cms.finance.received') }}</dt>
                    <dd class="is-good">{{ sum(finance.received_uzs) }}</dd>
                </div>
                <div v-if="finance.overpaid_uzs">
                    <dt>{{ t('cms.finance.overpaid') }}</dt>
                    <dd class="is-warn">{{ sum(finance.overpaid_uzs) }}</dd>
                </div>
                <div v-else>
                    <dt>
                        {{ t('cms.finance.balance') }}
                        <small v-if="finance.balance_uzs && finance.rates_date" class="tm-order-finance__rate">{{ t('cms.finance.rateAt', { date: finance.rates_date.split('-').reverse().join('.') }) }}</small>
                    </dt>
                    <dd>{{ sum(finance.balance_uzs) }}</dd>
                </div>

                <template v-if="finance.revenue_uzs !== null">
                    <div class="is-split">
                        <dt>{{ t('cms.finance.suppliers') }}</dt>
                        <dd>{{ sum(finance.paid_to_suppliers_uzs ?? 0) }}</dd>
                    </div>
                    <div>
                        <dt>{{ t('cms.finance.revenue') }}</dt>
                        <dd class="is-good is-strong">{{ sum(finance.revenue_uzs) }}</dd>
                    </div>
                </template>
            </dl>

            <p v-if="finance.legacy_paid" class="tm-finance__muted">{{ t('cms.finance.legacyPaid') }}</p>

            <p v-if="finance.missing_rates" class="tm-finance__warning" role="status">
                {{ t('cms.finance.missingRates', { n: finance.missing_rates }) }}
            </p>

            <div class="tm-finance__deposit">
                <div class="tm-finance__deposit-row">
                    <span>
                        {{ t('cms.finance.deposit', { percent: finance.deposit_percent }) }}
                        <template v-if="finance.deposit_met"> · {{ t('cms.finance.depositMet') }}</template>
                    </span>
                    <span class="tm-finance__muted">
                        {{ t('cms.finance.depositOf', { received: sum(Math.min(Math.max(0, finance.received_uzs), finance.deposit_uzs)), deposit: sum(finance.deposit_uzs) }) }}
                    </span>
                </div>

                <div class="tm-finance__bar" role="progressbar" :aria-valuenow="depositProgress" aria-valuemin="0" aria-valuemax="100">
                    <span :class="{ 'is-met': finance.deposit_met }" :style="{ width: `${depositProgress}%` }" />
                </div>

                <div v-if="editingDeposit" class="tm-finance__deposit-edit">
                    <Input v-model="depositDraft" type="number" :label="t('cms.finance.depositLabel')" />
                    <Button type="button" size="sm" :disabled="busy" @click="saveDeposit">{{ t('cms.save') }}</Button>
                    <Button type="button" size="sm" variant="ghost" @click="editingDeposit = false">{{ t('common.cancel') }}</Button>
                </div>
                <button v-else type="button" class="tm-finance__link" @click="editDeposit">{{ t('cms.finance.depositEdit') }}</button>
            </div>

            <div class="tm-finance__payments">
                <h3 class="tm-finance__subtitle">{{ t('cms.finance.payments') }}</h3>

                <p v-if="!rows.length" class="tm-finance__muted">{{ t('cms.finance.noPayments') }}</p>

                <ul v-else class="tm-finance__list">
                    <li v-for="row in rows" :key="row.uuid" class="tm-finance__payment" :class="{ 'is-reversed': row.reversed, 'is-reversal': row.reverses }">
                        <div class="tm-finance__payment-main">
                            <span class="tm-finance__payment-title">
                                {{ row.title }}
                                <span v-if="row.reversed" class="tm-finance__tag">{{ t('cms.finance.reversed') }}</span>
                            </span>
                            <span class="tm-finance__muted">{{ row.meta }}</span>
                            <span v-if="row.note" class="tm-finance__muted">{{ row.note }}</span>
                            <span class="tm-finance__payment-links">
                                <a v-if="row.receipt" :href="row.receipt.url" target="_blank" rel="noopener">{{ t('cms.finance.receiptLink') }}</a>
                                <button v-if="row.canReverse" type="button" class="tm-finance__link is-danger" :disabled="busy" @click="undo(row)">
                                    {{ t('cms.finance.reverse') }}
                                </button>
                            </span>
                        </div>

                        <div class="tm-finance__payment-amount" :class="{ 'is-out': row.outgoing }">
                            <span>{{ row.main }}</span>
                            <span v-if="row.sub" class="tm-finance__muted">{{ row.sub }}</span>
                        </div>
                    </li>
                </ul>
            </div>


            <Button type="button" icon="plus" class="tm-finance__record" @click="openForm">
                {{ t('cms.finance.record') }}
            </Button>

            <Modal
                v-model="paying"
                :title="t('cms.finance.record')"
                :confirm-label="t('cms.finance.form.save')"
                :busy="busy"
                :disabled="!canSave"
                size="md"
                @confirm="submit"
            >
                <div class="tm-finance__form">
                <div class="tm-finance__grid">
                    <Combobox v-model="draft.direction" variant="field" :label="t('cms.finance.form.direction')" :options="directions" />
                    <Combobox v-model="draft.method" variant="field" :label="t('cms.finance.form.method')" :options="methods" />
                    <PriceInput v-model="draft.amount" :label="t('cms.finance.form.amount')" />
                    <Combobox v-model="draft.currency" variant="field" :label="t('cms.finance.form.currency')" :options="currencies" />
                    <Input v-if="draft.currency !== 'UZS'" v-model="draft.fxRate" inputmode="decimal" :label="t('cms.finance.form.rate')" :hint="t('cms.finance.form.rateHint')" />
                    <Input v-model="draft.paidAt" type="date" :label="t('cms.finance.form.paidAt')" />
                </div>

                <label class="tm-finance__file">
                    <span class="tm-finance__file-label">
                        {{ t('cms.finance.form.receipt') }}<template v-if="needsReceipt"> *</template>
                    </span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" @change="pickReceipt">
                    <span v-if="needsReceipt && !draft.receipt" class="tm-finance__muted">{{ t('cms.finance.form.receiptRequired') }}</span>
                </label>

                <Input v-model="draft.note" :label="t('cms.finance.form.note')" />

                <p v-if="draftUzs !== null && draft.currency !== 'UZS'" class="tm-finance__muted">≈ {{ sum(draftUzs) }}</p>
                </div>
            </Modal>
        </template>
    </section>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import PaymentBadge from '~/modules/finance/components/paymentBadge/PaymentBadge.vue'
import PriceInput from '~/shared/components/priceInput/PriceInput.vue'
import { useOrderFinance } from './OrderFinance.hooks'
import type { IOrderFinanceEmits, IOrderFinanceProps } from './OrderFinance.d'

const props = defineProps<IOrderFinanceProps>()
const emit = defineEmits<IOrderFinanceEmits>()

const { t } = useI18n()

const {
    finance, loading, busy, paying, draft, rows, directions, methods, currencies,
    needsReceipt, draftUzs, canSave, depositProgress, editingDeposit, depositDraft,
    sum, openForm, pickReceipt, submit, undo, editDeposit, saveDeposit, reload,
} = useOrderFinance(props, next => emit('changed', next))

defineExpose({ reload, openForm })
</script>

<style lang="scss">
@use './_order-finance.scss';
</style>
