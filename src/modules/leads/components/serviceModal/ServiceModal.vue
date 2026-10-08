<template>
    <Modal
        v-model="open"
        :title="editing ? t('cms.orders.items.form.editTitle') : t('cms.orders.items.form.addTitle')"
        :confirm-label="editing ? t('cms.save') : t('cms.orders.items.form.add')"
        :busy="busy"
        :disabled="!valid"
        size="md"
        @confirm="submit"
    >
        <div class="tm-service-modal">
            <div class="tm-service-modal__kinds" role="radiogroup" :aria-label="t('cms.orders.items.form.kind')">
                <button
                    v-for="option in kinds" :key="option.kind"
                    type="button" role="radio"
                    class="tm-service-modal__kind"
                    :class="{ 'is-active': draft.kind === option.kind }"
                    :aria-checked="draft.kind === option.kind"
                    @click="pickKind(option.kind)"
                >
                    <Icon :name="option.icon" :size="18" />
                    <span>{{ option.label }}</span>
                </button>
            </div>

            <Input v-model="draft.title" :label="t('cms.orders.items.form.title')" :placeholder="placeholder" required />

            <div class="tm-service-modal__grid">
                <Input v-model="draft.supplier" :label="t('cms.orders.items.form.supplier')" />
                <div class="tm-service-modal__price">
                    <PriceInput v-model="draft.amount" :label="t('cms.orders.items.form.price')" required />
                    <Combobox v-model="draft.currency" variant="field" :label="t('cms.orders.items.form.currency')" :options="currencies" />
                </div>
                <Input v-model="draft.start" type="date" :label="t('cms.orders.items.form.start')" />
                <Input
                    v-model="draft.end" type="date"
                    :label="t('cms.orders.items.form.end')"
                    :error="datesWrong ? t('cms.orders.items.form.datesWrong') : undefined"
                />
            </div>

            <Input v-model="draft.note" :label="t('cms.orders.items.form.note')" />
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import PriceInput from '~/shared/components/priceInput/PriceInput.vue'
import { useServiceModal } from './ServiceModal.hooks'
import type { IServiceModalEmits, IServiceModalProps } from './ServiceModal.d'

const props = defineProps<IServiceModalProps>()
const emit = defineEmits<IServiceModalEmits>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()

const { draft, editing, kinds, currencies, valid, datesWrong, placeholder, pickKind, submit } =
    useServiceModal(props, open, body => emit('save', body))
</script>

<style lang="scss">
@use './_service-modal.scss';
</style>
