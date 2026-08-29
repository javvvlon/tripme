<template>
    <div class="tm-phone">
        <label v-if="label" :for="fieldId" class="tm-phone__label">
            {{ label }}<span v-if="required" aria-hidden="true"> *</span>
        </label>

        <div class="tm-phone__control" :class="{ 'has-error': error }">
            <span class="tm-phone__prefix">+{{ PHONE_COUNTRY_CODE }}</span>

            <input
                :id="fieldId"
                ref="field"
                type="tel"
                inputmode="numeric"
                class="tm-phone__field"
                :value="display"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :aria-invalid="error ? 'true' : undefined"
                :aria-describedby="error ? `${fieldId}-error` : undefined"
                autocomplete="tel-national"
                @input="onInput"
                @paste="onPaste"
                @blur="emit('blur')"
            >
        </div>

        <p v-if="error" :id="`${fieldId}-error`" class="tm-phone__error">{{ error }}</p>
        <p v-else-if="hint" class="tm-phone__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { PHONE_COUNTRY_CODE, formatPhone, phoneDigits } from '~/shared/helpers/phone'
import type { IPhoneInputProps } from './PhoneInput.d'

const props = defineProps<IPhoneInputProps>()

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ blur: [] }>()

const generated = useId()
const fieldId = computed(() => props.id ?? generated)

const field = useTemplateRef<HTMLInputElement>('field')

const placeholder = '(90) 123-45-67'

const display = computed(() => formatPhone(model.value))

/**
 * The caret is put back by counting digits rather than characters: inserting a
 * bracket or a dash shifts every position after it, and a caret that jumps to
 * the end on every keystroke makes the field unusable for corrections.
 */
async function commit(next: string, digitsBeforeCaret: number) {
    model.value = phoneDigits(next)

    await nextTick()

    const element = field.value

    if (!element) return

    const formatted = display.value
    let seen = 0
    let position = formatted.length

    for (let index = 0; index < formatted.length; index += 1) {
        if (/\d/.test(formatted[index]!)) seen += 1

        if (seen === digitsBeforeCaret) {
            position = index + 1
            break
        }
    }

    element.setSelectionRange(position, position)
}

function onInput(event: Event) {
    const element = event.target as HTMLInputElement
    const caret = element.selectionStart ?? element.value.length
    const digitsBeforeCaret = element.value.slice(0, caret).replace(/\D/g, '').length

    void commit(element.value, digitsBeforeCaret)
}

function onPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text')

    if (!pasted) return

    event.preventDefault()

    const digits = phoneDigits(pasted)

    void commit(digits, digits.length)
}
</script>

<style lang="scss">
@use './_phone-input.scss';
</style>
