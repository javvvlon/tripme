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
            :confirm-label="t('cms.save')"
            :busy="saving"
            :size="ModalSize.Large"
            :error="error"
            @update:model-value="editing = $event ? editing : null"
            @confirm="submit"
        >
            <div v-if="current" class="tm-cms-operators__form">
                <div class="tm-cms-operators__status">
                    <button
                        type="button" class="tm-cms-operators__switch"
                        :class="{ 'is-on': current.is_enabled }"
                        :aria-pressed="current.is_enabled"
                        :aria-label="t(current.is_enabled ? 'cms.operators.turnOff' : 'cms.operators.turnOn', { name: current.name })"
                        @click="flip(current)"
                    >
                        <span class="tm-cms-operators__knob" />
                    </button>
                    <span class="tm-cms-operators__state">{{ t(current.is_enabled ? 'cms.operators.inSearch' : 'cms.operators.offSearch') }}</span>
                    <code class="tm-cms-operators__code">{{ current.slug }}</code>
                    <span v-if="saved" class="tm-cms-operators__saved" role="status"><Icon name="check" :size="14" />{{ t('cms.saved') }}</span>
                </div>

                <div class="tm-cms-operators__grid">
                    <Input v-model="draft.name" dense :label="t('cms.operators.fields.name')" />
                    <Input v-model="draft.siteUrl" dense :label="t('cms.operators.fields.siteUrl')" :tip="t('cms.operators.tips.siteUrl')" placeholder="https://" />
                </div>

                <div class="tm-cms-operators__field">
                    <span class="tm-cms-operators__label">{{ t('cms.operators.fields.connection') }}</span>
                    <div class="tm-cms-operators__kinds" role="radiogroup" :aria-label="t('cms.operators.fields.connection')">
                        <button
                            v-for="option in connectionOptions" :key="option.value"
                            type="button" role="radio" class="tm-cms-operators__kind"
                            :class="{ 'is-on': draft.connection === option.value }"
                            :aria-checked="draft.connection === option.value"
                            @click="draft.connection = option.value"
                        >
                            <Icon :name="option.value === 'api' ? 'link' : 'globe'" :size="16" />
                            <span>
                                <strong>{{ option.label }}</strong>
                                <small>{{ t(`cms.operators.hints.${option.value}`) }}</small>
                            </span>
                        </button>
                    </div>
                </div>

                <div v-if="draft.connection === 'api'" class="tm-cms-operators__grid">
                    <Input v-model="draft.apiBaseUrl" dense :label="t('cms.operators.fields.apiBaseUrl')" placeholder="https://" />
                    <Input v-model="draft.apiLogin" dense :label="t('cms.operators.fields.apiLogin')" />
                    <Input
                        v-model="draft.apiKey" dense revealable type="password"
                        :label="t('cms.operators.fields.apiKey')"
                        :tip="t('cms.operators.secretHint')"
                        :placeholder="current.has_api_key ? t('cms.operators.stored') : ''"
                    />
                    <Input
                        v-model="draft.apiSecret" dense revealable type="password"
                        :label="t('cms.operators.fields.apiSecret')"
                        :tip="t('cms.operators.secretHint')"
                        :placeholder="current.has_api_secret ? t('cms.operators.stored') : ''"
                    />
                </div>

                <Input v-model="draft.note" dense :rows="2" :label="t('cms.operators.fields.note')" :placeholder="t('cms.operators.notePlaceholder')" />
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
