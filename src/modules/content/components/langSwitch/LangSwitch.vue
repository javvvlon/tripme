<template>
    <div class="tm-lang-switch" role="tablist" :aria-label="label">
        <Tooltip
            v-for="code in CONTENT_LOCALES" v-slot="{ tipId }" :key="code"
            :text="missingHint ?? ''" :disabled="!missingHint || !missing?.includes(code)"
        >
            <button
                type="button" role="tab" :aria-selected="model === code"
                class="tm-lang-switch__tab" :class="{ 'is-active': model === code }"
                :aria-describedby="tipId"
                @click="model = code"
            >
                {{ code.toUpperCase() }}
                <span v-if="missing?.includes(code)" class="tm-lang-switch__dot" aria-hidden="true" />
            </button>
        </Tooltip>
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
