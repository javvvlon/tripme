<template>
    <Modal
        v-model="opened"
        :title="t('quote.title')"
        :description="t('quote.lead', { n: tours.length })"
        :footer="false"
        size="md"
    >
        <div class="tm-quote">
            <div class="tm-quote__row">
                <Input v-model="client" :label="t('quote.fields.client')" :placeholder="t('quote.fields.clientPlaceholder')" />

                <div class="tm-quote__field">
                    <span class="tm-quote__label">{{ t('quote.fields.language') }}</span>
                    <div class="tm-quote__langs" role="radiogroup">
                        <button
                            v-for="code in LANGUAGES" :key="code"
                            type="button" role="radio"
                            class="tm-quote__lang" :class="{ 'is-on': language === code }"
                            :aria-checked="language === code"
                            @click="language = code"
                        >
                            {{ code.toUpperCase() }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="tm-quote__row">
                <Input v-model="passport" type="date" :label="t('quote.fields.passport')" :hint="t('quote.fields.passportHint')" />
                <Input v-model="includes" :label="t('quote.fields.includes')" :hint="t('quote.fields.includesHint')" />
            </div>

            <ul v-if="passportIssues.length" class="tm-quote__issues" role="alert">
                <li v-for="issue in passportIssues" :key="issue.tour.get('id')">
                    {{ t(issue.problem === 'expired' ? 'quote.passport.expired' : 'quote.passport.short', { hotel: issue.tour.displayName() }) }}
                </li>
            </ul>

            <div class="tm-quote__field">
                <label :for="textId" class="tm-quote__label">{{ t('quote.fields.text') }}</label>
                <textarea :id="textId" v-model="text" class="tm-quote__text" rows="14" />
            </div>

            <Checkbox v-if="canMarkLead && lead" v-model="markLead" :label="t('quote.markLead', { ref: lead.ref })" />

            <div class="tm-quote__actions">
                <Button icon="doc" @click="copy">{{ t('quote.copy') }}</Button>
                <Button v-if="pdf" variant="secondary" icon="doc" :disabled="pdfBusy" @click="emit('pdf')">
                    {{ pdfBusy ? t('cms.orders.documents.making') : t('quote.pdf') }}
                </Button>
                <Button variant="secondary" icon="telegram" @click="share('telegram')">Telegram</Button>
                <Button variant="secondary" icon="phone" @click="share('whatsapp')">WhatsApp</Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import { useQuoteModal } from './QuoteModal.hooks'
import type { IQuoteModalProps, QuoteLanguage } from './QuoteModal.d'

const props = defineProps<IQuoteModalProps>()

const opened = defineModel<boolean>({ default: false })

const emit = defineEmits<{ pdf: [] }>()

const LANGUAGES: QuoteLanguage[] = ['ru', 'uz', 'en']

const { t } = useI18n()
const textId = useId()

const {
    language, client, passport, includes, text, lead, markLead, canMarkLead,
    passportIssues, tours, copy, share,
} = useQuoteModal(props, opened)
</script>

<style lang="scss">
@use './_quote-modal.scss';
</style>
