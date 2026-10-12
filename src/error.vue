<template>
    <main class="tm-error">
        <div class="tm-error__glow" aria-hidden="true" />

        <NuxtLink :to="localePath('/')" class="tm-error__logo" :aria-label="t('nav.home')">
            <Logo :width="140" />
        </NuxtLink>

        <p class="tm-error__code">{{ code }}</p>
        <h1 class="tm-error__title">{{ missing ? t('errorPage.notFoundTitle') : t('errorPage.title') }}</h1>
        <p class="tm-error__text">{{ missing ? t('errorPage.notFoundText') : t('errorPage.text') }}</p>

        <div class="tm-error__actions">
            <Button size="lg" icon="search" @click="leave('/search')">{{ t('search.submit') }}</Button>
            <Button size="lg" variant="ghost" @click="leave('/')">{{ t('errorPage.home') }}</Button>
        </div>
    </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const code = computed(() => props.error?.statusCode ?? 500)
const missing = computed(() => code.value === 404)

useHead({ title: () => `${code.value} · TripMe` })

const leave = (path: string) => clearError({ redirect: localePath(path) })
</script>

<style lang="scss">
@use '~/shared/styles/utils' as *;

.tm-error {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 100vh;
    padding: 48px 24px;
    overflow: hidden;
    background: var(--tm-surface-2);
    color: var(--tm-ink-1);
    text-align: center;

    &__glow {
        position: absolute;
        top: -260px;
        right: -220px;
        width: 760px;
        height: 760px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--tm-brand-primary-glow) 0%, transparent 65%);
        pointer-events: none;
    }

    &__logo {
        position: relative;
        margin-bottom: 24px;
        color: var(--tm-ink-1);
    }

    &__code {
        @include display(900);
        position: relative;
        padding: .04em .3em 0;
        border-radius: radius('pill');
        background: var(--tm-brand-primary);
        color: var(--tm-brand-on-primary);
        font-size: clamp(#{size(56)}, 10vw, #{size(72)});
        line-height: 1;
        transform: skewX(-3deg) rotate(-1deg);
    }

    &__title {
        @include display(900);
        position: relative;
        max-width: 20ch;
        font-size: clamp(#{size(28)}, 4vw, #{size(44)});
        line-height: 1;
        text-wrap: balance;
    }

    &__text {
        position: relative;
        max-width: 46ch;
        color: var(--tm-ink-3);
        font-size: size(17);
    }

    &__actions {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        margin-top: 12px;
    }
}
</style>
