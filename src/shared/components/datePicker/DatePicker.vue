<template>
    <div class="tm-date-picker" :class="`tm-date-picker--${variant}`">
        <label :for="id" class="tm-date-picker__label">{{ label }}</label>

        <ClientOnly>
            <VueDatePicker
                :model-value="date"
                :disabled-dates="disabledDates"
                :min-date="minDate"
                :max-date="maxDate"
                :formats="{ input: format }"
                :input-attrs="{ id, autocomplete: 'off' }"
                :placeholder="placeholder"
                :disabled="disabled"
                auto-apply
                text-input
                teleport="body"
                @update:model-value="onChange"
            />
            <template #fallback>
                <input
                    :id="id" class="dp--input" type="text"
                    :placeholder="placeholder" :value="model" readonly
                >
            </template>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import type { IDatePickerProps } from './DatePicker.d'

const props = withDefaults(defineProps<IDatePickerProps>(), { variant: 'panel' })

const model = defineModel<string>({ default: '' })

const { locale } = useI18n()
const id = useId()

const date = computed(() => (model.value ? new Date(`${model.value}T00:00:00`) : null))

const toIso = (value: Date): string => {
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${value.getFullYear()}-${month}-${day}`
}

function onChange(value: Date | null) {
  model.value = value ? toIso(value) : ''
}

const format = (value: Date) =>
  new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(value)

const disabledDates = computed(() =>
  (props.calendar?.blocked ?? []).map(iso => new Date(`${iso}T00:00:00`)))

const minDate = computed(() => {
  const today = new Date()
  const start = props.calendar ? new Date(`${props.calendar.start}T00:00:00`) : today
  return start > today ? start : today
})

const maxDate = computed(() =>
  props.calendar ? new Date(`${props.calendar.horizon}T00:00:00`) : undefined)
</script>

<style lang="scss">
@use './_date-picker.scss';
</style>
