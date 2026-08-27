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
                    <h1 class="tm-auth__title">{{ t('auth.welcome') }}</h1>
                    <p class="tm-auth__lead">{{ t('auth.lead') }}</p>

                <form class="tm-auth__form" novalidate @submit.prevent="submit">
                    <Input
                        v-model="values.email"
                        :label="t('auth.email')"
                        :placeholder="t('auth.emailPlaceholder')"
                        type="email" autocomplete="username" required
                        :error="touched.email ? errors.email : undefined"
                        @blur="form.touch('email')"
                    />

                    <Input
                        v-model="values.password"
                        :label="t('auth.password')"
                        :placeholder="t('auth.passwordPlaceholder')"
                        type="password" autocomplete="current-password" required revealable
                        :error="touched.password ? errors.password : undefined"
                        @blur="form.touch('password')"
                    />

                    <p v-if="error" class="tm-auth__error" role="alert">{{ error }}</p>

                    <Button type="submit" size="lg" block :disabled="pending">
                        {{ pending ? t('auth.sending') : t('auth.login') }}
                    </Button>
                </form>

                    <NuxtLink :to="localePath('/')" class="tm-auth__back">{{ t('auth.backHome') }}</NuxtLink>
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
import { AUTH_BANNER } from './Auth.config'
import { useAuth } from './Auth.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { form, pending, error, submit } = useAuth()

const { values, errors, touched } = form

useSeoMeta({
  title: () => t('auth.seoTitle'),
  robots: 'noindex, nofollow',
})
</script>

<style lang="scss">
@use './_auth.scss';
</style>
