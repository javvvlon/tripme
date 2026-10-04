<template>
    <div class="tm-consent" :class="{ 'is-invalid': error }">
        <label class="tm-consent__row">
            <input v-model="model" type="checkbox" class="sr-only" :aria-invalid="Boolean(error)" :aria-describedby="error ? errorId : undefined">
            <span class="tm-consent__box"><Icon name="check" :size="13" :stroke="2.6" /></span>
            <i18n-t keypath="consent.text" tag="span" class="tm-consent__text" scope="global">
                <template #policy>
                    <NuxtLink :to="localePath('/legal/privacy')" target="_blank" class="tm-consent__link">{{ t('consent.policy') }}</NuxtLink>
                </template>
            </i18n-t>
        </label>

        <p v-if="error" :id="errorId" class="tm-consent__error" role="alert">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import type { IConsentCheckProps } from './ConsentCheck.d'

defineProps<IConsentCheckProps>()

const model = defineModel<boolean>({ default: false })

const { t } = useI18n()
const localePath = useLocalePath()
const errorId = useId()
</script>

<style lang="scss">
@use './_consent-check.scss';
</style>
