<template>
    <Modal
        v-model="open"
        :title="t('betaFeedback.title')"
        :description="t('betaFeedback.text')"
        :confirm-label="t('betaFeedback.submit')"
        :busy="sending"
        :error="error"
        size="md"
        @confirm="send"
    >
        <div class="tm-beta-feedback">
            <div class="tm-beta-feedback__names">
                <Input
                    v-model="form.firstName"
                    :label="t('contact.fields.firstName')"
                    :error="touched.firstName ? errors.firstName : ''"
                    autocomplete="given-name"
                    required
                    @blur="validation.touch('firstName')"
                />

                <PhoneInput
                    :id="phoneId"
                    v-model="form.phone"
                    :label="t('contact.fields.phone')"
                    :error="touched.phone ? errors.phone : ''"
                    required
                    @blur="validation.touch('phone')"
                />
            </div>

            <div class="tm-beta-feedback__field">
                <label :for="messageId" class="tm-beta-feedback__label">{{ t('betaFeedback.message') }}</label>

                <textarea
                    :id="messageId" v-model="form.message"
                    class="tm-beta-feedback__textarea" rows="4"
                    :maxlength="MESSAGE_MAX"
                    :placeholder="t('betaFeedback.placeholder')"
                    @blur="validation.touch('message')"
                />
                <p v-if="touched.message && errors.message" class="tm-beta-feedback__error">{{ errors.message }}</p>
            </div>

            <ConsentCheck
                v-model="form.consent"
                :error="touched.consent ? errors.consent : ''"
                @update:model-value="validation.touch('consent')"
            />
        </div>
    </Modal>
</template>

<script setup lang="ts">
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { MESSAGE_MAX } from '~/landing/components/contactPanel/ContactPanel.config'
import { useContactForm } from '~/landing/components/contactPanel/ContactPanel.hooks'
import type { IBetaFeedbackEmits } from './BetaFeedback.d'

const emit = defineEmits<IBetaFeedbackEmits>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const { saved } = useToast()

const phoneId = useId()
const messageId = useId()

const { form, validation, sending, sent, error, submit } = useContactForm({ topic: 'beta', messageRequired: true })

const { errors, touched } = validation

async function send() {
    await submit()

    if (!sent.value) return

    open.value = false
    saved(t('betaFeedback.sent'))
    emit('sent')
}
</script>

<style lang="scss">
@use './_beta-feedback.scss';
</style>
