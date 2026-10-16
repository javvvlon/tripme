<template>
    <div class="tm-esim-picker">
        <Combobox
            v-model="country" variant="field"
            :label="t('cms.leads.esim.country')"
            :options="countryOptions"
            :placeholder="t('cms.leads.esim.countryPlaceholder')"
        />

        <p v-if="country && status === 'pending' && !cards.length" class="tm-esim-picker__note">{{ t('cms.leads.esim.loading') }}</p>

        <p v-else-if="country && !cards.length" class="tm-esim-picker__note">{{ t('cms.leads.esim.noPlans') }}</p>

        <div v-else-if="cards.length" class="tm-esim-picker__grid">
            <button
                v-for="card in cards" :key="card.plan.id"
                type="button" class="tm-esim-picker__plan"
                @click="emit('pick', tripOf(card))"
            >
                <strong class="tm-esim-picker__volume">{{ card.volume }}</strong>
                <span class="tm-esim-picker__period">{{ card.period }}</span>
                <span class="tm-esim-picker__price">{{ card.price }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Combobox from '~/shared/components/combobox/Combobox.vue'
import { useEsimPicker } from './EsimPicker.hooks'
import type { IEsimPickerEmits, IEsimPickerProps } from './EsimPicker.d'

const props = defineProps<IEsimPickerProps>()
const emit = defineEmits<IEsimPickerEmits>()

const { t } = useI18n()

const { country, countryOptions, cards, status, tripOf } = useEsimPicker(() => props.initialCountry)
</script>

<style lang="scss">
@use './_esim-picker.scss';
</style>
