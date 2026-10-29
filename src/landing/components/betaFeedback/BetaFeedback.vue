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
                <span :id="categoryId" class="tm-beta-feedback__label">{{ t('betaFeedback.category') }}</span>

                <div class="tm-beta-feedback__categories" role="group" :aria-labelledby="categoryId">
                    <Chip
                        v-for="item in FEEDBACK_CATEGORIES" :key="item"
                        :active="category === item"
                        class="tm-beta-feedback__category" :class="`tm-beta-feedback__category--${item.toLowerCase()}`"
                        @click="category = item"
                    >
                        {{ t(`betaFeedback.categories.${item.toLowerCase()}`) }}
                    </Chip>
                </div>
            </div>

            <div class="tm-beta-feedback__field">
                <label :for="messageId" class="tm-beta-feedback__label">{{ t(`betaFeedback.message.${categoryKey}`) }}</label>

                <textarea
                    :id="messageId" v-model="form.message"
                    class="tm-beta-feedback__textarea" rows="4"
                    :maxlength="MESSAGE_MAX"
                    :placeholder="t(`betaFeedback.placeholder.${categoryKey}`)"
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
import { DEFAULT_CATEGORY, FEEDBACK_CATEGORIES } from './BetaFeedback.config'
import type { FeedbackCategory } from './BetaFeedback.config'
import type { IBetaFeedbackEmits } from './BetaFeedback.d'

const emit = defineEmits<IBetaFeedbackEmits>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()
const { saved } = useToast()

const phoneId = useId()
const messageId = useId()
const categoryId = useId()

const category = ref<FeedbackCategory>(DEFAULT_CATEGORY)
const categoryKey = computed(() => category.value.toLowerCase())

const { form, validation, sending, sent, error, submit } = useContactForm({
    topic: 'beta',
    messageRequired: true,
    extra: () => ({ category: category.value }),
})

const { errors, touched } = validation

async function send() {
    await submit()

    if (!sent.value) return

    open.value = false
    category.value = DEFAULT_CATEGORY
    saved(t('betaFeedback.sent'))
    emit('sent')
}
</script>

<style lang="scss">
@use './_beta-feedback.scss';
</style>
