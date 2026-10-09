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
                    <h1 class="tm-auth__title">{{ t('auth.reset.title') }}</h1>

                    <form v-if="step === 'email'" class="tm-auth__form" novalidate @submit.prevent="send">
                        <p class="tm-auth__lead">{{ t('auth.reset.lead') }}</p>
                        <Input v-model="email" :label="t('auth.email')" :placeholder="t('auth.emailPlaceholder')" type="email" autocomplete="username" required />
                        <p v-if="error" class="tm-auth__error" role="alert">{{ error }}</p>
                        <Button type="submit" size="lg" block :disabled="pending || !emailValid">{{ t('auth.reset.send') }}</Button>
                    </form>

                    <form v-else class="tm-auth__form" novalidate @submit.prevent="reset">
                        <p class="tm-auth__lead">{{ t('auth.reset.sent', { email }) }}</p>
                        <Input v-model="code" :label="t('auth.reset.code')" inputmode="numeric" autocomplete="one-time-code" required />
                        <Input v-model="password" :label="t('auth.reset.password')" type="password" autocomplete="new-password" :hint="t('auth.reset.passwordHint')" required revealable />
                        <p v-if="error" class="tm-auth__error" role="alert">{{ error }}</p>
                        <Button type="submit" size="lg" block :disabled="pending || !codeValid">{{ t('auth.reset.save') }}</Button>
                        <button type="button" class="tm-auth__link" :disabled="pending" @click="send">{{ t('auth.reset.again') }}</button>
                    </form>

                    <NuxtLink :to="localePath('/auth')" class="tm-auth__back">{{ t('auth.reset.back') }}</NuxtLink>
                </div>
            </div>

            <div class="tm-auth__aside" aria-hidden="true">
                <img class="tm-auth__banner" :src="AUTH_BANNER.image" :alt="AUTH_BANNER.alt" :width="AUTH_BANNER.width" :height="AUTH_BANNER.height" decoding="async">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AUTH_BANNER } from '../auth/Auth.config'
import { useReset } from './Reset.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { step, email, code, password, pending, error, emailValid, codeValid, send, reset } = useReset()

useSeoMeta({ title: () => t('auth.reset.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use '../auth/_auth.scss';
</style>
