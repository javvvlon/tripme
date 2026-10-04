<template>
    <div class="tm-auth">
        <div class="tm-auth__card">
            <div class="tm-auth__panel">
                <NuxtLink :to="localePath('/')">
                    <img
                        :src="BRAND_LOGO.onLight.src" :alt="BRAND_NAME"
                        :width="BRAND_LOGO.onLight.width" :height="BRAND_LOGO.onLight.height" class="tm-auth__logo"
                    >
                </NuxtLink>

                <div class="tm-auth__content">
                    <h1 class="tm-auth__title">{{ t('auth.registerTitle') }}</h1>
                    <p class="tm-auth__lead">{{ t('auth.registerLead') }}</p>

                    <form class="tm-auth__form" novalidate @submit.prevent="submit">
                        <div class="tm-auth__row">
                            <Input
                                v-model="values.firstName"
                                :label="t('auth.firstName')"
                                autocomplete="given-name" required
                                :error="touched.firstName ? errors.firstName : undefined"
                                @blur="form.touch('firstName')"
                            />

                            <Input
                                v-model="values.lastName"
                                :label="t('auth.lastName')"
                                autocomplete="family-name" required
                                :error="touched.lastName ? errors.lastName : undefined"
                                @blur="form.touch('lastName')"
                            />
                        </div>

                        <Input
                            v-model="values.email"
                            :label="t('auth.email')"
                            :placeholder="t('auth.emailPlaceholder')"
                            type="email" autocomplete="email" required
                            :error="touched.email ? errors.email : undefined"
                            @blur="form.touch('email')"
                        />

                        <PhoneInput
                            v-model="values.phone"
                            :label="t('auth.phone')"
                            required
                            :error="touched.phone ? errors.phone : undefined"
                            @blur="form.touch('phone')"
                        />

                        <div class="tm-auth__row">
                            <Input
                                v-model="values.password"
                                :label="t('auth.password')"
                                :hint="t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })"
                                type="password" autocomplete="new-password" required revealable
                                :error="touched.password ? errors.password : undefined"
                                @blur="form.touch('password')"
                            />

                            <Input
                                v-model="values.confirm"
                                :label="t('auth.confirmPassword')"
                                type="password" autocomplete="new-password" required revealable
                                :error="touched.confirm ? errors.confirm : undefined"
                                @blur="form.touch('confirm')"
                            />
                        </div>

                        <ConsentCheck
                            v-model="values.consent"
                            :error="touched.consent ? errors.consent : undefined"
                            @update:model-value="form.touch('consent')"
                        />

                        <p v-if="error" class="tm-auth__error" role="alert">{{ error }}</p>

                        <Button type="submit" size="lg" block :disabled="pending">
                            {{ pending ? t('auth.registering') : t('auth.signup') }}
                        </Button>
                    </form>

                    <p class="tm-auth__switch">
                        {{ t('auth.haveAccount') }}
                        <NuxtLink :to="localePath('/auth')">{{ t('auth.login') }}</NuxtLink>
                    </p>
                </div>
            </div>

            <div class="tm-auth__aside" aria-hidden="true">
                <img
                    class="tm-auth__banner"
                    :src="AUTH_BANNER.image" :alt="AUTH_BANNER.alt"
                    :width="AUTH_BANNER.width" :height="AUTH_BANNER.height"
                    fetchpriority="high" decoding="async"
                >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import PhoneInput from '~/shared/components/phoneInput/PhoneInput.vue'
import { AUTH_BANNER, MIN_PASSWORD_LENGTH } from '../auth/Auth.config'
import { useRegister } from './Register.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { form, pending, error, submit } = useRegister()

const { values, errors, touched } = form

useSeoMeta({
  title: () => t('auth.registerSeoTitle'),
  robots: 'noindex, nofollow',
})
</script>

<style lang="scss">
@use '../auth/_auth.scss';
</style>
