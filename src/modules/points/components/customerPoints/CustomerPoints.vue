<template>
    <section v-if="!missing" class="tm-customer-points">
        <div class="tm-customer-points__head">
            <h2 class="tm-customer-points__title">{{ t('cms.points.customer.title') }}</h2>

            <Button v-if="canManage && data" size="sm" variant="ghost" icon="pencil" @click="open">
                {{ t('cms.points.customer.adjust') }}
            </Button>
        </div>

        <p v-if="status === 'pending'" class="tm-customer-points__state">{{ t('cms.loading') }}</p>

        <p v-else-if="!data" class="tm-customer-points__state">{{ t('cms.points.customer.missing') }}</p>

        <template v-else>
            <div class="tm-customer-points__facts">
                <div class="tm-customer-points__fact">
                    <span class="tm-customer-points__label">{{ t('cms.points.customer.balance') }}</span>
                    <strong class="tm-customer-points__value">{{ points(data.summary.balance) }}</strong>
                </div>

                <div class="tm-customer-points__fact">
                    <span class="tm-customer-points__label">{{ t('cms.points.customer.tier') }}</span>
                    <TierBadge :tier="data.summary.tier" />
                </div>

                <div class="tm-customer-points__fact">
                    <span class="tm-customer-points__label">{{ t('cms.points.customer.discount') }}</span>
                    <strong class="tm-customer-points__value" :class="{ 'is-on': data.summary.tier }">
                        {{ data.summary.tier ? `${data.summary.tier.discount_percent}%` : '—' }}
                    </strong>
                </div>
            </div>

            <p v-if="data.summary.next" class="tm-customer-points__next">
                {{ t('cms.points.customer.next', { points: points(data.summary.to_next), tier: data.summary.next.name }) }}
            </p>

            <p v-if="data.summary.tier" class="tm-customer-points__hint">
                {{ t('cms.points.customer.applyHint', { percent: data.summary.tier.discount_percent }) }}
            </p>
        </template>

        <Modal
            v-model="adjusting"
            :title="t('cms.points.customer.adjustTitle')"
            :description="data?.user.name ?? ''"
            :confirm-label="t('cms.points.customer.adjustSubmit')"
            :busy="saving"
            :error="formError"
            size="sm"
            @confirm="submit"
        >
            <div class="tm-customer-points__direction" role="radiogroup">
                <label class="tm-customer-points__choice" :class="{ 'is-on': draft.direction === 'add' }">
                    <input v-model="draft.direction" type="radio" value="add">
                    {{ t('cms.points.customer.add') }}
                </label>
                <label class="tm-customer-points__choice" :class="{ 'is-on': draft.direction === 'take' }">
                    <input v-model="draft.direction" type="radio" value="take">
                    {{ t('cms.points.customer.take') }}
                </label>
            </div>

            <Input v-model="draft.amount" type="number" :label="t('cms.points.customer.amount')" placeholder="500" />
            <Input v-model="draft.note" :label="t('cms.points.customer.note')" :placeholder="t('cms.points.customer.notePlaceholder')" />
        </Modal>
    </section>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import TierBadge from '~/modules/points/components/tierBadge/TierBadge.vue'
import { useCustomerPoints } from './CustomerPoints.hooks'

const props = defineProps<{ userId: string }>()

const { t, locale } = useI18n()

const { data, status, missing, canManage, adjusting, draft, saving, formError, open, submit } = useCustomerPoints(() => props.userId)

const points = (value: number): string => value.toLocaleString(locale.value)
</script>

<style lang="scss">
@use './_customer-points.scss';
</style>
