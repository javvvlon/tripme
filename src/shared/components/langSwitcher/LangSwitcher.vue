<template>
    <div class="tm-lang-switcher" :class="`tm-lang-switcher--${tone}`">
        <Icon name="globe" :size="16" />
        <label :for="id" class="sr-only">{{ t('common.language') }}</label>
        <select :id="id" :value="locale" @change="switchTo">
            <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option>
        </select>
        <span aria-hidden="true">{{ currentName }}</span>
        <Icon name="chevron" :size="14" />
    </div>
</template>

<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import type { ILangSwitcherProps } from './LangSwitcher.d'

withDefaults(defineProps<ILangSwitcherProps>(), { tone: 'onDark' })

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const id = useId()

const currentName = computed(() =>
  (locales.value as LocaleObject[]).find(l => l.code === locale.value)?.name ?? locale.value,
)

function switchTo(event: Event) {
  const code = (event.target as HTMLSelectElement).value
  return navigateTo(switchLocalePath(code as typeof locale.value))
}
</script>

<style lang="scss">
@use './_lang-switcher.scss';
</style>
