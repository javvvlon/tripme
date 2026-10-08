<template>
    <div class="tm-lang-switch" role="tablist" :aria-label="label">
        <button
            v-for="code in CONTENT_LOCALES" :key="code"
            type="button" role="tab" :aria-selected="model === code"
            class="tm-lang-switch__tab" :class="{ 'is-active': model === code }"
            :title="missing?.includes(code) ? missingHint : undefined"
            @click="model = code"
        >
            {{ code.toUpperCase() }}
            <span v-if="missing?.includes(code)" class="tm-lang-switch__dot" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { ILangSwitchProps } from './LangSwitch.d'

defineProps<ILangSwitchProps>()

const model = defineModel<ContentLocale>({ default: CMS_DEFAULT_LOCALE })
</script>

<style lang="scss">
@use './_lang-switch.scss';
</style>
