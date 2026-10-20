<template>
    <section class="tm-checklist" :class="{ 'is-done': confirmed }">
        <header class="tm-checklist__head">
            <div class="tm-checklist__heading">
                <h2 class="tm-checklist__title">{{ t('cms.orders.checklist.title') }}</h2>
                <span class="tm-checklist__count">{{ t('cms.orders.checklist.progress', { done: doneCount, total: rows.length }) }}</span>
            </div>

            <span v-if="confirmed" class="tm-checklist__done">{{ t('cms.orders.checklist.confirmed') }}</span>

            <Button
                v-else-if="status === 'draft'"
                type="button" size="sm"
                :variant="requestReady ? 'primary' : 'ghost'"
                :disabled="busy || !requestReady"
                @click="emit('request')"
            >
                {{ t('cms.orders.checklist.request') }}
            </Button>

            <Button
                v-else-if="status === 'requested'"
                type="button" size="sm"
                :variant="confirmation.ready ? 'primary' : 'ghost'"
                :disabled="busy || (!confirmation.ready && confirmation.mode === 'enforce')"
                @click="emit('confirm')"
            >
                {{ t('cms.orders.checklist.confirm') }}
            </Button>
        </header>

        <div class="tm-checklist__bar" aria-hidden="true">
            <span v-for="row in rows" :key="row.key" :class="`is-${tone(row)}`" />
        </div>

        <ul class="tm-checklist__list">
            <li v-for="row in rows" :key="row.key" class="tm-checklist__row" :class="`is-${tone(row)}`">
                <span class="tm-checklist__label">
                    <span class="tm-checklist__mark" aria-hidden="true">
                        <Icon v-if="row.ok" name="check" :size="12" :stroke="2.6" />
                        <Icon v-else-if="tone(row) === 'error'" name="close" :size="12" :stroke="2.6" />
                        <span v-else class="tm-checklist__bang">!</span>
                    </span>
                    {{ row.label }}
                </span>

                <span class="tm-checklist__detail">{{ row.detail }}</span>
                <span v-if="blocksRequest(row)" class="tm-checklist__gate">{{ t('cms.orders.checklist.beforeRequest') }}</span>

                <template v-if="!row.ok && !confirmed || row.key === 'contract' && !row.ok">
                    <button v-if="row.key === 'contract'" type="button" class="tm-checklist__action" :disabled="busy" @click="file?.click()">
                        {{ busy ? t('cms.orders.checklist.contractUploading') : t('cms.orders.checklist.contractUpload') }}
                    </button>
                    <button v-else-if="row.target" type="button" class="tm-checklist__action" @click="emit('go', row.target)">
                        {{ row.action }}
                    </button>
                </template>
            </li>
        </ul>

        <input ref="file" type="file" class="tm-checklist__file" accept="application/pdf,image/png,image/jpeg,image/webp" @change="pick">

        <p v-if="status === 'draft' && !requestReady" class="tm-checklist__hint is-gate">
            {{ fullPayment ? t('cms.orders.checklist.requestGateFull') : t('cms.orders.checklist.requestGate') }}
        </p>

        <p v-if="status === 'requested' && !confirmation.ready" class="tm-checklist__hint">
            {{ confirmation.mode === 'enforce' ? t('cms.orders.checklist.enforceMode') : t('cms.orders.checklist.warnMode') }}
        </p>
    </section>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import Icon from '~/shared/components/icon/Icon.vue'
import { formatDate } from '~/shared/helpers/format-date'
import type { ChecklistTarget, IOrderChecklistEmits, IOrderChecklistProps } from './OrderChecklist.d'
import type { ConfirmationCheck } from '~/modules/leads/contracts/leads'

const props = defineProps<IOrderChecklistProps>()
const emit = defineEmits<IOrderChecklistEmits>()

const { t, locale } = useI18n()

const file = useTemplateRef<HTMLInputElement>('file')

const confirmed = computed(() => ['confirmed', 'issued', 'travelling', 'completed'].includes(props.status))

const severity = computed(() =>
    props.confirmation.mode === 'enforce' && !confirmed.value ? 'error' : 'warning')

const sum = (value: number) =>
    `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)} ${t('cms.finance.sum')}`

interface IRow {
    key: string
    ok: boolean
    label: string
    detail: string
    target?: ChecklistTarget
    action?: string
}

const fullPayment = computed(() => Boolean(props.confirmation.checks) && !props.confirmation.checks!.includes('passport'))

const rows = computed<IRow[]>(() => {
    const c = props.confirmation
    const passport = {
        missing: t('cms.orders.checklist.passportMissing'),
        expired: t('cms.orders.checklist.passportExpired'),
        short: t('cms.orders.checklist.passportShort'),
    }

    const all: IRow[] = [
        {
            key: 'suppliers',
            ok: c.suppliers.ok,
            label: t('cms.orders.checklist.suppliers'),
            detail: c.suppliers.ok
                ? t('cms.orders.checklist.suppliersOk')
                : t('cms.orders.checklist.suppliersWaiting', { list: c.suppliers.pending.join(', ') }),
            target: 'services',
            action: t('cms.orders.checklist.goServices'),
        },
        {
            key: 'contract',
            ok: c.contract.ok,
            label: t('cms.orders.checklist.contract'),
            detail: c.contract.signed_at
                ? t('cms.orders.checklist.contractOk', { date: formatDate(c.contract.signed_at, locale.value, { dateStyle: 'medium' }) })
                : t('cms.orders.checklist.contractMissing'),
        },
        {
            key: 'deposit',
            ok: c.deposit.ok,
            label: t(fullPayment.value ? 'cms.orders.checklist.payment' : 'cms.orders.checklist.deposit'),
            detail: c.deposit.legacy
                ? t('cms.orders.checklist.depositLegacy')
                : t('cms.orders.checklist.depositDetail', {
                    received: sum(Math.min(Math.max(0, c.deposit.received_uzs), c.deposit.deposit_uzs)),
                    deposit: sum(c.deposit.deposit_uzs),
                }),
            target: 'finance',
            action: t('cms.orders.checklist.goFinance'),
        },
        {
            key: 'passport',
            ok: c.passport.ok,
            label: t('cms.orders.checklist.passport'),
            detail: c.passport.problem ? passport[c.passport.problem] : t('cms.orders.checklist.passportOk'),
            target: 'details',
            action: t('cms.orders.checklist.goDetails'),
        },
    ]

    return all.filter(row => !c.checks || c.checks.includes(row.key as ConfirmationCheck))
})

const doneCount = computed(() => rows.value.filter(row => row.ok).length)

const requestReady = computed(() => props.confirmation.request?.ready ?? true)

const blocksRequest = (row: IRow): boolean =>
    props.status === 'draft' && !row.ok && Boolean(props.confirmation.request?.missing.includes(row.key as ConfirmationCheck))

const tone = (row: IRow): 'ok' | 'warning' | 'error' => {
    if (row.ok) return 'ok'
    if (blocksRequest(row)) return 'error'

    return severity.value
}

function pick(event: Event) {
    const input = event.target as HTMLInputElement
    const chosen = input.files?.[0]

    if (chosen) emit('contract', chosen)
    input.value = ''
}
</script>

<style lang="scss">
@use './_order-checklist.scss';
</style>
