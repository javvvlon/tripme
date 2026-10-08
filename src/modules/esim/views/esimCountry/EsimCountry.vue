<template>
    <div class="tm-esim-country container-wide">
        <NuxtLink :to="localePath('/esim')" class="tm-esim-country__back">
            <Icon name="chevron-left" :size="16" />
            {{ t('esim.allCountries') }}
        </NuxtLink>

        <header class="tm-esim-country__head">
            <span class="tm-esim-country__flag" aria-hidden="true">{{ flag }}</span>
            <div>
                <h1 class="tm-esim-country__title">{{ t('esim.countryTitle', { country: name }) }}</h1>
                <p v-if="networks" class="tm-esim-country__lead">{{ t('esim.networks', { list: networks }) }}</p>
            </div>
        </header>

        <EditorSkeleton v-if="status === 'pending' && !cards.length" variant="rows" />

        <p v-else-if="error || !cards.length" class="tm-esim-country__empty">{{ t('esim.noPlans') }}</p>

        <div v-else class="tm-esim-country__layout">
            <section class="tm-esim-country__plans" :aria-label="t('esim.choosePlan')">
                <div class="tm-esim-country__grid" role="radiogroup" :aria-label="t('esim.choosePlan')">
                    <button
                        v-for="card in cards" :key="card.id"
                        type="button" role="radio"
                        class="tm-esim-plan"
                        :class="{ 'is-active': selected === card.id }"
                        :aria-checked="selected === card.id"
                        @click="selected = card.id"
                    >
                        <span class="tm-esim-plan__volume">{{ card.volume }}</span>
                        <span class="tm-esim-plan__period">{{ card.period }}</span>
                        <span class="tm-esim-plan__price">{{ card.price }}</span>
                        <span class="tm-esim-plan__per-day">{{ card.perDay }}</span>
                        <span class="tm-esim-plan__mark" aria-hidden="true"><Icon name="check" :size="14" /></span>
                    </button>
                </div>

                <ol class="tm-esim-country__steps">
                    <li v-for="step in 3" :key="step">
                        <span class="tm-esim-country__step-no">{{ step }}</span>
                        <span>
                            <strong>{{ t(`esim.steps.${step}.title`) }}</strong>
                            {{ t(`esim.steps.${step}.text`) }}
                        </span>
                    </li>
                </ol>
            </section>

            <aside class="tm-esim-checkout">
                <h2 class="tm-esim-checkout__title">{{ t('esim.checkout') }}</h2>

                <div v-if="plan" class="tm-esim-checkout__plan">
                    <span>{{ flag }} {{ name }} · {{ plan.volume }} · {{ plan.period }}</span>
                </div>

                <form class="tm-esim-checkout__form" novalidate @submit.prevent="pay">
                    <Input
                        v-model="email" type="email" autocomplete="email"
                        :label="t('esim.email')" :hint="t('esim.emailHint')" :error="emailError" required
                    />
                    <PhoneInput v-model="phone" :label="t('esim.phone')" :error="phoneError" required />

                    <fieldset class="tm-esim-checkout__methods">
                        <legend>{{ t('esim.payWith') }}</legend>

                        <label
                            v-for="option in methodOptions" :key="option.value"
                            class="tm-esim-method" :class="[`is-${option.value}`, { 'is-active': method === option.value }]"
                        >
                            <input v-model="method" type="radio" name="esim-method" :value="option.value" class="sr-only">
                            <span class="tm-esim-method__logo" aria-hidden="true">{{ option.label.slice(0, 1) }}</span>
                            <span class="tm-esim-method__text">
                                <strong>{{ option.label }}</strong>
                                <small>{{ option.hint }}</small>
                            </span>
                            <span v-if="option.sandbox" class="tm-esim-method__test">{{ t('esim.test') }}</span>
                        </label>
                    </fieldset>

                    <div v-if="plan" class="tm-esim-checkout__total">
                        <span>{{ t('esim.total') }}</span>
                        <strong>{{ plan.price }}</strong>
                    </div>

                    <Button type="submit" size="lg" :disabled="busy" class="tm-esim-checkout__pay">
                        {{ plan ? t('esim.payPrice', { price: plan.price }) : t('esim.choosePlan') }}
                    </Button>

                    <p class="tm-esim-checkout__legal">
                        {{ t('esim.legal') }}
                        <NuxtLink :to="localePath('/legal/offer')">{{ t('esim.offer') }}</NuxtLink>
                    </p>
                </form>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { useEsimCountry } from './EsimCountry.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const {
    name, flag, networks, cards, plan, selected, status, error,
    email, phone, method, methodOptions, emailError, phoneError, busy, pay,
} = useEsimCountry()

useSeoMeta({
    title: () => t('esim.seo.countryTitle', { country: name.value }),
    description: () => t('esim.seo.countryDescription', { country: name.value }),
})
</script>

<style lang="scss">
@use './_esim-country.scss';
</style>
