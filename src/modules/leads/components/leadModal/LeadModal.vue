<template>
    <Modal
        v-model="open"
        :title="heading"
        :description="summary || t('lead.lead')"
        :confirm-label="t('lead.submit')"
        :busy="sending"
        :busy-label="t('lead.sending')"
        :error="error"
        :footer="!sent"
        size="md"
        @confirm="confirm"
        @dismiss="reset"
    >
        <div v-if="sent" ref="done" class="tm-lead__sent">
            <p class="tm-lead__done" role="status">{{ t('lead.sent') }}</p>

            <footer class="tm-lead__foot">
                <Button type="button" variant="secondary" @click="open = false">{{ t('common.close') }}</Button>
            </footer>
        </div>

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
                    :placeholder="commentPlaceholder || t('lead.fields.commentPlaceholder')"
                />
            </div>

            <ConsentCheck
                v-model="draft.consent"
                :error="touched.consent ? errors.consent : ''"
                @update:model-value="validation.touch('consent')"
            />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { productOf } from '~/modules/leads/helpers/product'
import { useLeadForm } from './LeadModal.hooks'
import { LEAD_TITLES } from './LeadModal.config'
import type { ILeadModalProps } from './LeadModal.d'

const props = defineProps<ILeadModalProps>()

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ sent: [] }>()

const { t } = useI18n()
const commentId = useId()

const { draft, validation, sending, sent, error, submit, reset } = useLeadForm(() => props.trip)
const { errors, touched } = validation

const heading = computed(() => props.title || t(LEAD_TITLES[productOf(props.trip)]))

const done = useTemplateRef<HTMLElement>('done')

async function confirm() {
    if (!await submit()) return

    emit('sent')

    await nextTick()
    done.value?.querySelector<HTMLElement>('button')?.focus()
}

watch(open, (next) => {
    if (next) reset()
})
</script>

<style lang="scss">
@use './_lead-modal.scss';
</style>
