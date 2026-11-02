<template>
    <div ref="root" class="tm-phone" @focusout="onFocusOut" @keydown.esc="onEscape">
        <label v-if="label" :for="fieldId" class="tm-phone__label">
            {{ label }}<span v-if="required" aria-hidden="true"> *</span>
        </label>

        <div class="tm-phone__control" :class="{ 'has-error': error, 'is-open': open }">
            <button
                type="button"
                class="tm-phone__country"
                :disabled="disabled"
                :aria-label="t('phone.country', { country: nameOf(country), code: country.code })"
                aria-haspopup="listbox"
                :aria-expanded="open"
                :aria-controls="listId"
                @click="toggle"
                @keydown.down.prevent="open || toggle()"
            >
                <span class="tm-phone__flag" aria-hidden="true">{{ flagOf(country.iso) }}</span>
                <span class="tm-phone__code">+{{ country.code }}</span>
                <Icon :name="open ? 'chevron-up' : 'chevron'" :size="14" class="tm-phone__caret" />
            </button>

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

        <div v-if="open" class="tm-phone__menu">
            <div class="tm-phone__search">
                <Icon name="search" :size="16" />
                <input
                    ref="search"
                    v-model="query"
                    type="search"
                    class="tm-phone__search-field"
                    role="combobox"
                    :placeholder="t('phone.search')"
                    :aria-label="t('phone.search')"
                    aria-autocomplete="list"
                    aria-expanded="true"
                    :aria-controls="listId"
                    :aria-activedescendant="activeId"
                    autocomplete="off"
                    @keydown.down.prevent="move(1)"
                    @keydown.up.prevent="move(-1)"
                    @keydown.enter.prevent="choose(options[active])"
                >
            </div>

            <ul :id="listId" ref="list" class="tm-phone__options" role="listbox" :aria-label="t('phone.countries')">
                <li
                    v-for="(option, i) in options"
                    :id="`${listId}-${option.iso}`"
                    :key="option.iso"
                    role="option"
                    class="tm-phone__option"
                    :class="{ 'is-active': i === active, 'is-selected': option.iso === country.iso, 'is-break': !query && option.pinned && !options[i + 1]?.pinned }"
                    :aria-selected="option.iso === country.iso"
                    @mousedown.prevent="choose(option)"
                    @mousemove="active = i"
                >
                    <span class="tm-phone__flag" aria-hidden="true">{{ flagOf(option.iso) }}</span>
                    <span class="tm-phone__name">{{ option.name }}</span>
                    <span class="tm-phone__dial">+{{ option.code }}</span>
                </li>
                <li v-if="!options.length" class="tm-phone__empty">{{ t('phone.empty') }}</li>
            </ul>
        </div>

        <p v-if="error" :id="`${fieldId}-error`" class="tm-phone__error">{{ error }}</p>
        <p v-else-if="hint" class="tm-phone__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { flagOf } from '~/shared/helpers/country'
import type { IPhoneInputProps } from './PhoneInput.d'
import { usePhoneInput } from './PhoneInput.hooks'

const props = defineProps<IPhoneInputProps>()

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ blur: [] }>()

const { t } = useI18n()

const generated = useId()
const fieldId = computed(() => props.id ?? generated)
const listId = computed(() => `${fieldId.value}-countries`)

const field = useTemplateRef<HTMLInputElement>('field')
const search = useTemplateRef<HTMLInputElement>('search')
const list = useTemplateRef<HTMLElement>('list')
const root = useTemplateRef<HTMLElement>('root')

const {
  country, display, placeholder, nameOf, onInput, onPaste,
  open, query, active, options, toggle, move, choose, onEscape, onFocusOut,
} = usePhoneInput(model, { field, search, list, root })

const activeId = computed(() => {
  const option = options.value[active.value]

  return option ? `${listId.value}-${option.iso}` : undefined
})
</script>

<style lang="scss">
@use './_phone-input.scss';
</style>
