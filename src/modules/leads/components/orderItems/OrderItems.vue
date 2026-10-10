<template>
    <section class="tm-order-items">
        <header class="tm-order-items__head">
            <h2 class="tm-order-items__title">{{ t('cms.orders.items.title') }} · {{ activeCount }}</h2>

            <Button v-if="!locked" type="button" size="sm" variant="secondary" icon="plus" @click="addService">
                {{ t('cms.orders.items.add') }}
            </Button>
        </header>

        <p v-if="!items.length" class="tm-order-items__empty">{{ t('cms.orders.items.empty') }}</p>

        <ul v-else class="tm-order-items__list">
            <li v-for="item in rows" :key="item.uuid" class="tm-order-items__item" :class="{ 'is-inactive': item.inactive }">
                <span class="tm-order-items__kind" :class="`is-${item.kind}`" aria-hidden="true">
                    <Icon :name="item.icon" :size="18" />
                </span>

                <div class="tm-order-items__main">
                    <div class="tm-order-items__labels">
                        <span class="tm-order-items__kind-name">{{ t(`cms.orders.items.kinds.${item.kind}`) }}</span>
                        <span v-if="item.tracked || item.inactive" class="tm-order-items__status" :class="`is-${item.status}`">
                            {{ t(`cms.orders.items.status.${item.status}`) }}
                        </span>
                    </div>

                    <p class="tm-order-items__name">{{ item.title || t(`cms.orders.items.kinds.${item.kind}`) }}</p>
                    <p v-if="item.meta" class="tm-order-items__meta">{{ item.meta }}</p>
                    <p v-if="item.when" class="tm-order-items__meta">{{ item.when }}</p>
                    <p v-if="item.note" class="tm-order-items__meta">{{ item.note }}</p>
                    <p v-if="item.supplier_ref" class="tm-order-items__ref">
                        {{ t('cms.orders.items.ref', { ref: item.supplier_ref }) }}
                    </p>

                    <Button v-if="item.confirmButton" type="button" size="sm" variant="secondary" icon="check" class="tm-order-items__confirm" @click="startConfirm(item)">
                        {{ t('cms.orders.items.confirm') }}
                    </Button>

                    <div v-if="item.canIssue || item.canEdit || item.canRemove" class="tm-order-items__actions">
                        <button v-if="item.canIssue" type="button" class="tm-order-items__action" @click="startIssue(item)">
                            {{ t('cms.orders.items.issue') }}
                        </button>
                        <button v-if="item.canEdit" type="button" class="tm-order-items__action" @click="editService(item)">
                            {{ t('cms.orders.items.edit') }}
                        </button>
                        <button v-if="item.canRemove" type="button" class="tm-order-items__action is-danger" @click="removeService(item)">
                            {{ t('cms.orders.items.remove') }}
                        </button>
                    </div>
                </div>

                <div v-if="item.price" class="tm-order-items__money">
                    <p class="tm-order-items__price">{{ item.price }}</p>
                    <template v-if="item.foreign && !item.inactive">
                        <p v-if="item.uzs" class="tm-order-items__uzs">{{ item.uzs }}</p>
                        <p class="tm-order-items__rate" :class="{ 'is-missing': !item.fx_rate }">
                            {{ item.rateText }}
                        </p>
                    </template>
                </div>
            </li>
        </ul>

        <ServiceModal
            v-model="serviceOpen"
            :item="serviceItem"
            :start="start"
            :end="end"
            :busy="busy"
            @save="saveService"
        />

        <Modal
            :model-value="Boolean(confirming)"
            :title="t('cms.orders.items.confirm')"
            :description="confirmingTitle"
            :confirm-label="t('cms.save')"
            :busy="busy"
            :disabled="!refDraft.trim()"
            size="sm"
            @update:model-value="confirming = $event ? confirming : ''"
            @confirm="saveConfirm"
        >
            <Input v-model="refDraft" :label="t('cms.orders.items.refLabel')" placeholder="EB-58213" />
        </Modal>

        <Modal
            :model-value="Boolean(issuing)"
            :title="t('cms.orders.items.issueTitle')"
            :description="issuingTitle"
            :confirm-label="t('cms.orders.items.issueConfirm')"
            :busy="busy"
            size="sm"
            @update:model-value="issuing = $event ? issuing : ''"
            @confirm="saveIssue"
        >
            <label class="tm-order-items__file">
                <span class="tm-order-items__file-label">{{ t('cms.orders.items.issueFile') }}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" @change="pickIssueFile">
            </label>
        </Modal>
    </section>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import Button from '~/shared/components/button/Button.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import ServiceModal from '~/modules/leads/components/serviceModal/ServiceModal.vue'
import { useOrderItems } from './OrderItems.hooks'
import type { IOrderItemsEmits, IOrderItemsProps } from './OrderItems.d'

const props = defineProps<IOrderItemsProps>()
const emit = defineEmits<IOrderItemsEmits>()

const { t } = useI18n()

const {
    rows, activeCount, confirming, refDraft, confirmingTitle,
    serviceOpen, serviceItem, issuing, issuingTitle,
    startConfirm, saveConfirm, addService, editService, saveService,
    startIssue, pickIssueFile, saveIssue, removeService, done,
} = useOrderItems(props, emit)

defineExpose({ done, addService })
</script>

<style lang="scss">
@use './_order-items.scss';
</style>
