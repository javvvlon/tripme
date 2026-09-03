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

/**
 * The three the agency actually sells in. A free-text field here meant
 * "usd", "USD " and "у.е." all sat in the same column.
 */
const options = CURRENCIES.map(code => ({ value: code, label: code }))
</script>
