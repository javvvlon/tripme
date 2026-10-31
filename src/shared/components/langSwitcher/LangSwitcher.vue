<template>
    <div v-if="variant === 'inline'" class="tm-lang-switcher tm-lang-switcher--inline" role="radiogroup" :aria-label="t('common.language')">
        <NuxtLink
            v-for="item in items" :key="item.code"
            :to="item.to" role="radio" :aria-checked="item.active" :lang="item.language"
            class="tm-lang-switcher__option" :class="{ 'is-active': item.active }"
            @click="choose(item.code)"
        >
            {{ item.name }}
        </NuxtLink>
    </div>

    <div v-else ref="root" class="tm-lang-switcher" :class="[`tm-lang-switcher--${tone}`, { 'is-open': open }]">
        <button
            type="button" class="tm-lang-switcher__control"
            :aria-label="t('common.language')" aria-haspopup="menu" :aria-expanded="open"
            @click="open = !open"
        >
            <Icon name="globe" :size="16" />
            <span class="tm-lang-switcher__name">{{ current?.name ?? locale }}</span>
            <span class="tm-lang-switcher__code">{{ locale.toUpperCase() }}</span>
            <Icon name="chevron" :size="14" class="tm-lang-switcher__caret" />
        </button>

        <ul v-if="open" class="tm-lang-switcher__menu" role="menu" :aria-label="t('common.language')">
            <li v-for="item in items" :key="item.code" role="none">
                <NuxtLink
                    :to="item.to" role="menuitemradio" :aria-checked="item.active" :lang="item.language"
                    class="tm-lang-switcher__item" :class="{ 'is-active': item.active }"
                    @click="choose(item.code)"
                >
                    <span class="tm-lang-switcher__dot" aria-hidden="true" />
                    <span class="tm-lang-switcher__label">{{ item.name }}</span>
                    <span class="tm-lang-switcher__item-code" aria-hidden="true">{{ item.code.toUpperCase() }}</span>
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from './LangSwitcher.config'
import type { ILangSwitcherProps } from './LangSwitcher.d'

withDefaults(defineProps<ILangSwitcherProps>(), { tone: 'onDark', variant: 'menu' })

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

const cookie = useCookie<string>(LOCALE_COOKIE, { maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: 'lax', path: '/' })

const current = computed(() => (locales.value as LocaleObject[]).find(item => item.code === locale.value))

const items = computed(() => (locales.value as LocaleObject[]).map(item => ({
    code: item.code,
    name: item.name ?? item.code,
    language: item.language,
    active: item.code === locale.value,
    to: { path: switchLocalePath(item.code), query: route.query, hash: route.hash },
})))

function choose(code: string) {
    open.value = false
    cookie.value = code

    try {
        localStorage.setItem(LOCALE_COOKIE, code)
    }
    catch {}
}

const outside = (event: MouseEvent) => {
    if (root.value && !root.value.contains(event.target as Node)) open.value = false
}

const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') open.value = false
}

watch(open, (value) => {
    if (!import.meta.client) return

    if (value) {
        document.addEventListener('mousedown', outside)
        document.addEventListener('keydown', onKey)
        void nextTick(() => root.value?.querySelector<HTMLElement>('[role=menuitemradio]')?.focus())
    }
    else {
        document.removeEventListener('mousedown', outside)
        document.removeEventListener('keydown', onKey)
    }
})

watch(() => route.fullPath, () => { open.value = false })

onBeforeUnmount(() => {
    if (!import.meta.client) return

    document.removeEventListener('mousedown', outside)
    document.removeEventListener('keydown', onKey)
})
</script>

<style lang="scss">
@use './_lang-switcher.scss';
</style>
