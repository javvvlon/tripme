<template>
    <Combobox
        v-model="model"
        :label="label ?? t('common.currency')"
        :options="options"
        :disabled="disabled"
        :clearable="clearable"
        variant="field"
    />
</template>

<script setup lang="ts">
import Combobox from '~/shared/components/combobox/Combobox.vue'
import { CURRENCIES } from '~/shared/helpers/money'
import type { ICurrencySelectProps } from './CurrencySelect.d'

defineProps<ICurrencySelectProps>()

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const options = CURRENCIES.map(code => ({ value: code, label: code }))
</script>
