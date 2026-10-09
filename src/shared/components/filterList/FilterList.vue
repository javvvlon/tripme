<template>
    <div class="tm-filter-list">
        <label v-if="expanded && searchable" class="tm-filter-list__search">
            <Icon name="search" :size="16" />
            <input v-model="needle" type="search" :placeholder="searchLabel" :aria-label="searchLabel">
        </label>

        <ul class="tm-filter-list__options" :class="{ 'is-scrolling': expanded && options.length > SCROLL_AFTER }">
            <li v-for="option in shown" :key="option.value">
                <label class="tm-filter-list__option" :class="{ 'is-on': selected.includes(option.value) }">
                    <input
                        type="checkbox" class="sr-only"
                        :checked="selected.includes(option.value)"
                        @change="emit('toggle', option.value)"
                    >
                    <span class="tm-filter-list__box" aria-hidden="true"><Icon name="check" :size="12" :stroke="2.6" /></span>
                    <span class="tm-filter-list__label">{{ option.label }}</span>
                    <span class="tm-filter-list__count">{{ option.count }}</span>
                </label>
            </li>

            <li v-if="expanded && needle && !shown.length" class="tm-filter-list__none">{{ t('filters.nothing') }}</li>
        </ul>

        <button
            v-if="options.length > visibleLimit"
            type="button" class="tm-filter-list__more"
            :aria-expanded="expanded"
            @click="toggleExpanded"
        >
            {{ expanded ? t('filters.showLess') : t('filters.showAll', { count: options.length }) }}
            <Icon :name="expanded ? 'chevron-up' : 'chevron'" :size="14" />
        </button>
    </div>
</template>

<script setup lang="ts">
import type { IFilterListEmits, IFilterListProps } from './FilterList.d'

const props = withDefaults(defineProps<IFilterListProps>(), { limit: 6, searchLabel: '' })
const emit = defineEmits<IFilterListEmits>()

const { t } = useI18n()

const SEARCH_AFTER = 10
const SCROLL_AFTER = 12

const expanded = ref(false)
const needle = ref('')

const visibleLimit = computed(() => Math.max(props.limit, props.options.length <= props.limit + 2 ? props.options.length : props.limit))

const searchable = computed(() => props.options.length > SEARCH_AFTER)

const shown = computed(() => {
  if (!expanded.value) {
    const head = props.options.slice(0, visibleLimit.value)
    const hiddenSelected = props.options.slice(visibleLimit.value).filter(option => props.selected.includes(option.value))

    return [...head, ...hiddenSelected]
  }

  const query = needle.value.trim().toLocaleLowerCase()

  return query ? props.options.filter(option => option.label.toLocaleLowerCase().includes(query)) : props.options
})

function toggleExpanded() {
  expanded.value = !expanded.value
  needle.value = ''
}
</script>

<style lang="scss">
@use './_filter-list.scss';
</style>
