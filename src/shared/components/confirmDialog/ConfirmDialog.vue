<template>
    <Modal
        v-if="pending"
        :model-value="true"
        :title="pending.title"
        :description="pending.description"
        :confirm-label="pending.confirmLabel ?? t('common.delete')"
        :cancel-label="pending.cancelLabel ?? t('common.cancel')"
        :tone="pending.tone"
        @update:model-value="pending?.settle(false)"
        @confirm="pending.settle(true)"
        @dismiss="pending.settle(false)"
    >
        <p v-if="pending.subject" class="tm-confirm__subject">{{ pending.subject }}</p>

        <p class="tm-confirm__warning">{{ t('common.deleteWarning') }}</p>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'

const { t } = useI18n()
const { pending } = useConfirm()
</script>

<style lang="scss">
@use './_confirm-dialog.scss';
</style>
