<template>
    <div class="tm-input">
        <label v-if="label" :for="id" class="tm-input__label">
            {{ label }}<span v-if="required" aria-hidden="true"> *</span>
        </label>

        <div class="tm-input__control">
            <input
                :id="id"
                v-model="model"
                :type="resolvedType"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :disabled="disabled"
                :required="required"
                :aria-invalid="error ? 'true' : undefined"
                :aria-describedby="describedBy"
                class="tm-input__field"
                :class="{
                    'tm-input__field--invalid': error,
                    'tm-input__field--revealable': revealable,
                }"
                @blur="emit('blur')"
            >

            <button
                v-if="revealable"
                type="button" class="tm-input__reveal"
                :aria-label="revealed ? t('common.hidePassword') : t('common.showPassword')"
                :aria-pressed="revealed"
                @click="revealed = !revealed"
            >
                <Icon :name="revealed ? 'eye-off' : 'eye'" :size="18" />
            </button>
        </div>

        <p v-if="error" :id="`${id}-error`" class="tm-input__error">{{ error }}</p>
        <p v-else-if="hint" :id="`${id}-hint`" class="tm-input__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import type { IInputProps } from './Input.d'

const props = withDefaults(defineProps<IInputProps>(), { type: 'text' })

/**
 * A number, not only a string: Vue casts the value of `type="number"` as
 * soon as someone types in it, and typing this as a string made every
 * numeric field lie about what it holds.
 */
const model = defineModel<string | number>({ default: '' })
const emit = defineEmits<{ blur: [] }>()

const { t } = useI18n()
const id = useId()

const revealed = ref(false)

const resolvedType = computed(() =>
  props.revealable && revealed.value ? 'text' : props.type,
)

const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  return props.hint ? `${id}-hint` : undefined
})
</script>

<style lang="scss">
@use './_input.scss';
</style>
