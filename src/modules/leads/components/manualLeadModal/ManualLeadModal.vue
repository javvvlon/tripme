<template>
    <Modal
        v-model="open"
        :title="t('cms.leads.create.title')"
        :description="t('cms.leads.create.lead')"
        :confirm-label="t('cms.leads.create.submit')"
        :busy="saving"
        :error="error"
        size="md"
        @confirm="submit"
        @dismiss="reset"
    >
        <fieldset class="tm-manual-lead__group">
            <legend>{{ t('cms.leads.sections.client') }}</legend>

            <div class="tm-manual-lead__row">
                <Input
                    v-model="draft.firstName"
                    :label="t('lead.fields.firstName')"
                    :error="touched.firstName ? errors.firstName : ''"
                    required
                    @blur="validation.touch('firstName')"
                />

                <Input
                    v-model="draft.lastName"
                    :label="t('lead.fields.lastName')"
                    :error="touched.lastName ? errors.lastName : ''"
                    required
                    @blur="validation.touch('lastName')"
                />
            </div>

            <PhoneInput
                v-model="draft.phone"
                :label="t('lead.fields.phone')"
                :error="touched.phone ? errors.phone : ''"
                required
                @blur="validation.touch('phone')"
            />
        </fieldset>

        <fieldset class="tm-manual-lead__group">
            <legend>{{ t('cms.leads.sections.trip') }}</legend>

            <div class="tm-manual-lead__row">
                <Input v-model="draft.hotelName" :label="t('cms.leads.columns.tour')" />
                <Input v-model="draft.supplierName" :label="t('cms.leads.columns.supplier')" />
            </div>

            <div class="tm-manual-lead__row">
                <Input v-model="draft.routeFrom" :label="t('cms.leads.create.routeFrom')" />
                <Input v-model="draft.routeTo" :label="t('cms.leads.create.routeTo')" />
            </div>

            <div class="tm-manual-lead__row is-four">
                <Input v-model="draft.checkIn" type="date" :label="t('cms.leads.create.checkIn')" />
                <Input v-model="draft.nights" type="number" :label="t('cms.leads.create.nights')" />
                <Input v-model="draft.adults" type="number" :label="t('cms.leads.create.adults')" />
                <Input v-model="draft.children" type="number" :label="t('cms.leads.create.children')" />
            </div>

            <div class="tm-manual-lead__row">
                <Input v-model="draft.priceAmount" type="number" :label="t('cms.leads.columns.price')" />
                <Input v-model="draft.priceCurrency" :label="t('cms.leads.create.currency')" placeholder="USD" />
            </div>
        </fieldset>

        <div class="tm-manual-lead__field">
            <label :for="commentId" class="tm-manual-lead__label">{{ t('lead.fields.comment') }}</label>

            <textarea
                :id="commentId" v-model="draft.comment"
                class="tm-manual-lead__textarea" rows="3" maxlength="2000"
                :placeholder="t('lead.fields.commentPlaceholder')"
            />
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { useManualLead } from './ManualLeadModal.hooks'
import type { ILeadRaw } from '~/modules/leads/contracts/leads'

const emit = defineEmits<{ created: [lead: ILeadRaw] }>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const commentId = useId()

const { draft, validation, saving, error, submit, reset } = useManualLead((lead) => {
    open.value = false
    emit('created', lead)
})
const { errors, touched } = validation

watch(open, (next) => {
    if (next) reset()
})
</script>

<style lang="scss">
@use './_manual-lead-modal.scss';
</style>
