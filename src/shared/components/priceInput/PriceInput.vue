<template>
    <div class="tm-price">
        <label v-if="label" :for="fieldId" class="tm-price__label">
            {{ label }}<span v-if="required" aria-hidden="true"> *</span>
        </label>

        <div class="tm-price__control" :class="{ 'has-error': error, 'is-disabled': disabled }">
            <input
                :id="fieldId"
                ref="field"
                type="text"
                inputmode="decimal"
                class="tm-price__field"
                :value="display"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :aria-invalid="error ? 'true' : undefined"
                :aria-describedby="error ? `${fieldId}-error` : undefined"
                @input="onInput"
                @blur="emit('blur')"
            >

            <span v-if="currency" class="tm-price__currency">{{ currency }}</span>
        </div>

        <p v-if="error" :id="`${fieldId}-error`" class="tm-price__error">{{ error }}</p>
        <p v-else-if="hint" class="tm-price__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { formatPrice, priceDigits, priceInput, priceValue } from '~/shared/helpers/money'
import type { IPriceInputProps } from './PriceInput.d'

const props = defineProps<IPriceInputProps>()

const model = defineModel<number | string | null>({ default: null })

const emit = defineEmits<{ blur: [] }>()

const fieldId = useId()
const field = useTemplateRef<HTMLInputElement>('field')

const digits = ref(priceInput(model.value))

const display = computed(() => formatPrice(digits.value))

watch(model, (next) => {
    /** Only when the change came from elsewhere, or typing would fight itself. */
    if (priceValue(digits.value) !== next) digits.value = priceInput(next)
})

/**
 * Groups the number as it is typed while keeping the caret where the person
 * left it: the spaces added ahead of it shift everything right, so the caret
 * is placed by counting digits rather than characters.
 */
function onInput(event: Event) {
    const input = event.target as HTMLInputElement
    const before = input.selectionStart ?? input.value.length
    const digitsBefore = input.value.slice(0, before).replace(/\D/g, '').length

    digits.value = priceDigits(input.value)
    model.value = priceValue(digits.value)

    void nextTick(() => {
        if (!field.value) return

        const text = field.value.value
        let seen = 0
        let at = text.length

        for (let i = 0; i < text.length; i += 1) {
            if (/\d/.test(text[i]!)) seen += 1

            if (seen === digitsBefore) { at = i + 1; break }
        }

        field.value.setSelectionRange(at, at)
    })
}
</script>

<style lang="scss">
@use './_price-input.scss';
</style>
