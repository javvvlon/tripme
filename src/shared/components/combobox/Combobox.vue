<template>
    <div
        class="tm-combobox" :class="[`tm-combobox--${variant}`, { 'is-attention': attention }]"
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
                @keydown.enter.prevent="choose(items[active])"
                @keydown.esc="close"
            >
            <Icon
                v-if="variant === 'field'"
                name="chevron" :size="16" class="tm-combobox__caret"
            />

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

        <Transition name="tm-combobox-menu">
            <ul v-if="open" :id="`${id}-menu`" class="tm-combobox__menu" :class="{ 'is-end': menuAlign === 'end' }" role="listbox">
                <li v-for="(option, i) in items" :key="option.value">
                    <span
                        v-if="option.group && option.group !== items[i - 1]?.group"
                        class="tm-combobox__group" role="presentation"
                    >{{ option.group }}</span>
                    <button
                        type="button" role="option"
                        class="tm-combobox__option"
                        :class="{ 'is-active': i === active, 'is-selected': option.value === model, 'is-pinned': option === pinned }"
                        :aria-selected="option.value === model"
                        @mousedown.prevent="choose(option)"
                    >
                        <Icon v-if="option === pinned" name="grid" :size="16" class="tm-combobox__pin-icon" />
                        <span class="tm-combobox__text">
                            {{ option.label }}
                            <span v-if="option.hint" class="tm-combobox__hint">{{ option.hint }}</span>
                        </span>
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
        </Transition>
    </div>
</template>

<script setup lang="ts">
import type { IComboboxEmits, IComboboxOption, IComboboxProps } from './Combobox.d'

const props = withDefaults(defineProps<IComboboxProps>(), { variant: 'panel', pinned: null })
const emit = defineEmits<IComboboxEmits>()

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

const typing = computed(() => {
  const needle = query.value.trim().toLowerCase()

  return Boolean(needle) && needle !== selected.value?.label.toLowerCase()
})

const items = computed(() => (props.pinned && !typing.value ? [props.pinned, ...filtered.value] : filtered.value))

const inputRef = useTemplateRef<HTMLInputElement>('input')

function onFocus() {
  open.value = true
  active.value = Math.max(0, items.value.findIndex(o => o.value === model.value))
}

function openMenu() {
  if (props.disabled) return

  inputRef.value?.focus()
  open.value = true
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
  const count = items.value.length
  if (!count) return
  active.value = (active.value + step + count) % count
}

function choose(option: IComboboxOption | undefined) {
  if (!option) return

  if (option === props.pinned) {
    open.value = false
    query.value = selected.value?.label ?? ''
    emit('pinned')
    return
  }

  model.value = option.value
  open.value = false
  query.value = option.label
}

function clear() {
  model.value = ''
  query.value = ''
  open.value = false
}

defineExpose({ openMenu })
</script>

<style lang="scss">
@use './_combobox.scss';
</style>
