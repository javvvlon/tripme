<template>
    <div class="tm-cms-operators">
        <SectionHead
            :level="1"
            :title="t('cms.operators.title')"
            :sub="t('cms.operators.lead', counts)"
        />


        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <ul v-else class="tm-cms-operators__list">
            <li
                v-for="operator in operators" :key="operator.uuid"
                class="tm-cms-operators__item" :class="{ 'is-off': !operator.is_enabled }"
            >
                <button
                    type="button" class="tm-cms-operators__switch"
                    :class="{ 'is-on': operator.is_enabled }"
                    :aria-pressed="operator.is_enabled"
                    :aria-label="t(operator.is_enabled ? 'cms.operators.turnOff' : 'cms.operators.turnOn', { name: operator.name })"
                    @click="flip(operator)"
                >
                    <span class="tm-cms-operators__knob" />
                </button>

                <div class="tm-cms-operators__identity">
                    <p class="tm-cms-operators__name">{{ operator.name }}</p>
                    <p class="tm-cms-operators__slug">{{ operator.slug }}</p>
                </div>

                <span class="tm-cms-operators__badge" :class="`is-${operator.connection}`">
                    {{ t(`cms.operators.connections.${operator.connection}`) }}
                </span>

                <span v-if="operator.connection === 'api'" class="tm-cms-operators__keys">
                    <Icon :name="operator.has_api_key ? 'check' : 'close'" :size="14" />
                    {{ t(operator.has_api_key ? 'cms.operators.keySet' : 'cms.operators.keyMissing') }}
                </span>
                <span v-else />

                <Button type="button" size="sm" variant="ghost" @click="open(operator)">
                    {{ t('cms.operators.configure') }}
                </Button>
            </li>
        </ul>

        <Modal
            :model-value="Boolean(editing)"
            :title="current?.name ?? ''"
            :description="t('cms.operators.configureLead')"
            :confirm-label="t('cms.save')"
            :busy="saving"
            :size="ModalSize.Medium"
            :error="error"
            @update:model-value="editing = $event ? editing : null"
            @confirm="submit"
        >
            <p v-if="saved" class="tm-cms-operators__saved" role="status">{{ t('cms.saved') }}</p>

            <Input v-model="draft.name" :label="t('cms.operators.fields.name')" />

            <div class="tm-cms-operators__field">
                <span class="tm-cms-operators__label">{{ t('cms.operators.fields.connection') }}</span>
                <SelectMenu v-model="draft.connection" :options="connectionOptions" />
                <p class="tm-cms-operators__hint">{{ t(`cms.operators.hints.${draft.connection}`) }}</p>
            </div>

            <Input v-model="draft.siteUrl" :label="t('cms.operators.fields.siteUrl')" placeholder="https://" />

            <template v-if="draft.connection === 'api'">
                <Input v-model="draft.apiBaseUrl" :label="t('cms.operators.fields.apiBaseUrl')" placeholder="https://" />
                <Input v-model="draft.apiLogin" :label="t('cms.operators.fields.apiLogin')" />

                <Input
                    v-model="draft.apiKey"
                    type="password"
                    :label="t('cms.operators.fields.apiKey')"
                    :placeholder="current?.has_api_key ? t('cms.operators.stored') : ''"
                    :hint="t('cms.operators.secretHint')"
                    revealable
                />

                <Input
                    v-model="draft.apiSecret"
                    type="password"
                    :label="t('cms.operators.fields.apiSecret')"
                    :placeholder="current?.has_api_secret ? t('cms.operators.stored') : ''"
                    revealable
                />
            </template>

            <div class="tm-cms-operators__field">
                <label :for="noteId" class="tm-cms-operators__label">{{ t('cms.operators.fields.note') }}</label>
                <textarea :id="noteId" v-model="draft.note" class="tm-cms-operators__textarea" rows="3" />
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import { ModalSize } from '~/shared/components/modal/Modal.config'
import { useOperators } from './Operators.hooks'

const { t } = useI18n()
const noteId = useId()

const {
    operators, status, error, saving, saved,
    editing, current, draft, connectionOptions, counts,
    open, flip, submit,
} = useOperators()

useSeoMeta({ title: () => t('cms.operators.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_operators.scss';
</style>
