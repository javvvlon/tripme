<template>
    <section class="tm-contact">
        <div class="container-wide">
            <div class="tm-contact__panel">
                <div class="tm-contact__intro">
                    <h2 class="tm-contact__title">{{ t('contact.title') }}</h2>
                    <p class="tm-contact__lead">{{ t('contact.lead') }}</p>

                    <ul class="tm-contact__channels">
                        <li v-for="channel in CONTACT_CHANNELS" :key="channel.key" class="tm-contact__channel">
                            <span class="tm-contact__icon" aria-hidden="true">
                                <Icon :name="channel.icon" :size="20" />
                            </span>

                            <h3 class="tm-contact__channel-name">{{ t(`contact.channels.${channel.key}`) }}</h3>

                            <a v-if="channel.href" :href="channel.href" class="tm-contact__channel-value">
                                {{ t(channel.valueKey) }}
                            </a>
                            <p v-else class="tm-contact__channel-value">{{ t(channel.valueKey) }}</p>
                        </li>
                    </ul>
                </div>

                <form class="tm-contact__form" novalidate @submit.prevent="submit">
                    <div class="tm-contact__names">
                        <FormRow
                            :label="t('contact.fields.firstName')" :for="firstNameId" required
                            :error="touched.firstName ? errors.firstName : undefined"
                        >
                            <Input
                                :id="firstNameId" v-model="form.firstName"
                                :placeholder="t('contact.fields.firstName')"
                                autocomplete="given-name"
                                @blur="validation.touch('firstName')"
                            />
                        </FormRow>

                        <FormRow :label="t('contact.fields.lastName')" :for="lastNameId">
                            <Input
                                :id="lastNameId" v-model="form.lastName"
                                :placeholder="t('contact.fields.lastName')"
                                autocomplete="family-name"
                            />
                        </FormRow>
                    </div>

                    <FormRow
                        :label="t('contact.fields.phone')" :for="phoneId" required
                        :error="touched.phone ? errors.phone : undefined"
                    >
                        <div class="tm-contact__phone">
                            <span class="tm-contact__prefix">{{ PHONE_PREFIX }}</span>
                            <Input
                                :id="phoneId" v-model="form.phone" type="tel"
                                :placeholder="t('contact.fields.phonePlaceholder')"
                                autocomplete="tel-national"
                                @blur="validation.touch('phone')"
                            />
                        </div>
                    </FormRow>

                    <FormRow :label="t('contact.fields.message')" :for="messageId">
                        <textarea
                            :id="messageId" v-model="form.message"
                            class="tm-contact__textarea" rows="5"
                            :maxlength="MESSAGE_MAX"
                            :placeholder="t('contact.fields.messagePlaceholder')"
                        />
                    </FormRow>

                    <p v-if="error" class="tm-contact__error" role="alert">{{ error }}</p>
                    <p v-else-if="sent" class="tm-contact__sent" role="status">{{ t('contact.sent') }}</p>

                    <Button type="submit" size="lg" block :disabled="sending">
                        {{ sending ? t('contact.sending') : t('contact.submit') }}
                    </Button>
                </form>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { CONTACT_CHANNELS, MESSAGE_MAX, PHONE_PREFIX } from './ContactPanel.config'
import { useContactForm } from './ContactPanel.hooks'

const { t } = useI18n()

const { form, validation, sending, sent, error, submit } = useContactForm()
const { errors, touched } = validation

const firstNameId = useId()
const lastNameId = useId()
const phoneId = useId()
const messageId = useId()
</script>

<style lang="scss">
@use './_contact-panel.scss';
</style>
