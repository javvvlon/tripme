<template>
    <Modal
        v-model="open"
        :title="t('lead.title')"
        :description="summary || t('lead.lead')"
        :confirm-label="t('lead.submit')"
        :busy="sending"
        :error="error"
        size="md"
        @confirm="submit"
        @dismiss="reset"
    >
        <template v-if="sent">
            <p class="tm-lead__done" role="status">{{ t('lead.sent') }}</p>
        </template>

        <template v-else>
            <div class="tm-lead__names">
                <Input
                    v-model="draft.firstName"
                    :label="t('lead.fields.firstName')"
                    :placeholder="t('lead.fields.firstName')"
                    :error="touched.firstName ? errors.firstName : ''"
                    autocomplete="given-name"
                    required
                    @blur="validation.touch('firstName')"
                />

                <Input
                    v-model="draft.lastName"
                    :label="t('lead.fields.lastName')"
                    :placeholder="t('lead.fields.lastName')"
                    :error="touched.lastName ? errors.lastName : ''"
                    autocomplete="family-name"
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

            <div class="tm-lead__field">
                <label :for="commentId" class="tm-lead__label">{{ t('lead.fields.comment') }}</label>

                <textarea
                    :id="commentId" v-model="draft.comment"
                    class="tm-lead__textarea" rows="3" maxlength="2000"
                    :placeholder="t('lead.fields.commentPlaceholder')"
                />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { useLeadForm } from './LeadModal.hooks'
import type { ILeadModalProps } from './LeadModal.d'

const props = defineProps<ILeadModalProps>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const commentId = useId()

const { draft, validation, sending, sent, error, submit, reset } = useLeadForm(() => props.trip)
const { errors, touched } = validation

watch(open, (next) => {
    if (next) reset()
})
</script>

<style lang="scss">
@use './_lead-modal.scss';
</style>
