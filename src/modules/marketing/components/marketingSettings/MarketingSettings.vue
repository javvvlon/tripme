<template>
    <Modal
        v-model="open"
        :title="t('cms.marketing.settings.title')"
        :confirm-label="canEdit ? t('common.save') : t('cms.marketing.settings.close')"
        :busy="busy"
        size="lg"
        @confirm="save"
    >
        <div class="tm-ad-settings">
            <Tabs v-model="tab" :items="tabs" variant="segment" :aria-label="t('cms.marketing.settings.title')" />

            <div v-if="tab === 'voice'" class="tm-ad-settings__pane">
                <div class="tm-ad-settings__voice-head">
                    <span class="tm-ad-settings__hint">{{ t('cms.marketing.settings.voiceHint') }}</span>
                    <Button v-if="canEdit && !isDefault" size="sm" variant="ghost" icon="undo" @click="resetVoice">{{ t('cms.marketing.settings.reset') }}</Button>
                </div>
                <textarea
                    v-model="voice"
                    class="tm-ad-settings__voice"
                    rows="16" maxlength="4000"
                    :readonly="!canEdit"
                    :aria-label="t('cms.marketing.settings.voice')"
                />
                <span class="tm-ad-settings__count">{{ voice.length }} / 4000</span>
            </div>

            <div v-else class="tm-ad-settings__pane">
                <span class="tm-ad-settings__hint">{{ t('cms.marketing.settings.managersHint') }}</span>

                <ul class="tm-ad-settings__contacts">
                    <li v-for="(contact, index) in contacts" :key="index" class="tm-ad-settings__contact">
                        <Input v-model="contact.name" :label="t('cms.marketing.settings.buttonName')" :disabled="!canEdit" dense />
                        <Input v-model="contact.telegram" :label="t('cms.marketing.settings.telegram')" placeholder="@username" :disabled="!canEdit" dense />
                        <IconButton v-if="canEdit" icon="trash" :label="t('cms.marketing.remove')" @click="removeContact(index)" />
                    </li>
                </ul>

                <Button v-if="canEdit && contacts.length < max" size="sm" variant="secondary" icon="plus" class="tm-ad-settings__add" @click="addContact">
                    {{ t('cms.marketing.settings.addManager') }}
                </Button>

                <Input v-model="footer.ru" :label="`${t('cms.marketing.settings.footer')} · RU`" :rows="3" :disabled="!canEdit" dense />
                <Input v-model="footer.uz" :label="`${t('cms.marketing.settings.footer')} · UZ`" :rows="3" :disabled="!canEdit" dense />
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Tabs from '~/shared/components/tabs/Tabs.vue'
import { useMarketingSettings } from './MarketingSettings.hooks'
import type { IMarketingSettings } from '../../contracts/marketing'

const props = defineProps<{ settings: IMarketingSettings | null, tab?: 'voice' | 'managers' }>()

const emit = defineEmits<{ saved: [settings: IMarketingSettings] }>()

const open = defineModel<boolean>({ default: false })

const { t } = useI18n()

const {
    tab, tabs, voice, footer, contacts, busy, canEdit, isDefault, resetVoice, addContact, removeContact, save, max,
} = useMarketingSettings(props, open, next => emit('saved', next))
</script>

<style lang="scss">
@use './_marketing-settings.scss';
</style>
