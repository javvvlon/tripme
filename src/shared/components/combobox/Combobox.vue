<template>
    <div
        class="tm-combobox" :class="`tm-combobox--${variant}`"
        @mousedown="openFromAnywhere"
    >
        <label :for="id" class="tm-combobox__label">{{ label }}</label>

        <div class="tm-combobox__control">
            <Icon v-if="icon" :name="icon" :size="17" class="tm-combobox__icon" />
            <input
                :id="id"
                ref="input"
                v-model="query"
                type="text"
                class="tm-combobox__input"
                role="combobox"
                :placeholder="placeholder"
                :disabled="disabled"
                :aria-expanded="open"
                :aria-controls="`${id}-menu`"
                aria-autocomplete="list"
                autocomplete="off"
                @focus="onFocus"
                @blur="onBlur"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="choose(filtered[active])"
                @keydown.esc="close"
            >
            <button
                v-if="clearable && model"
                type="button" class="tm-combobox__clear"
                :aria-label="t('search.clearField', { field: label })"
                @mousedown.prevent="clear"
            >
                <Icon name="close" :size="14" :stroke="2.2" />
            </button>
        </div>

        <p v-if="note" class="tm-combobox__note">{{ note }}</p>

        <ul v-if="open" :id="`${id}-menu`" class="tm-combobox__menu" role="listbox">
            <li v-for="(option, i) in filtered" :key="option.value">
                <button
                    type="button" role="option"
                    class="tm-combobox__option"
                    :class="{ 'is-active': i === active, 'is-selected': option.value === model }"
                    :aria-selected="option.value === model"
                    @mousedown.prevent="choose(option)"
                >
                    {{ option.label }}
                    <span v-if="option.hint" class="tm-combobox__hint">{{ option.hint }}</span>
                </button>
            </li>
            <li v-if="!filtered.length" class="tm-combobox__empty">
                {{
                    loading ? t('common.loading')
                    : unavailable ? t('search.referencesUnavailable')
                    : t('search.noMatches')
                }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { IComboboxOption, IComboboxProps } from './Combobox.d'

const props = withDefaults(defineProps<IComboboxProps>(), { variant: 'panel' })

const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const id = useId()

const open = ref(false)
const active = ref(0)
const query = ref('')

const selected = computed(() => props.options.find(o => o.value === model.value) ?? null)

watch([selected, open], () => {
  if (!open.value) query.value = selected.value?.label ?? ''
}, { immediate: true })

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()

  if (!needle || needle === selected.value?.label.toLowerCase()) return props.options

  return props.options.filter(o =>
    o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle))
})

const inputRef = useTemplateRef<HTMLInputElement>('input')

function onFocus() {
  open.value = true
  active.value = Math.max(0, filtered.value.findIndex(o => o.value === model.value))
}

function openFromAnywhere(event: MouseEvent) {
  if (props.disabled) return

  const target = event.target as HTMLElement
  if (target.closest('.tm-combobox__clear, .tm-combobox__menu')) return

  if (document.activeElement !== inputRef.value) inputRef.value?.focus()
  else open.value = true
}

function onBlur() {
  close()
}

function close() {
  open.value = false
  query.value = selected.value?.label ?? ''
}

function move(step: number) {
  if (!open.value) { open.value = true; return }
  const count = filtered.value.length
  if (!count) return
  active.value = (active.value + step + count) % count
}

function choose(option: IComboboxOption | undefined) {
  if (!option) return
  model.value = option.value
  open.value = false
  query.value = option.label
}

function clear() {
  model.value = ''
  query.value = ''
  open.value = false
}
</script>

<style lang="scss">
@use './_combobox.scss';
</style>
