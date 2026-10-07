<template>
    <nav class="tm-pagination" :aria-label="t('pagination.label')">
        <p class="tm-pagination__range">
            <template v-if="total">
                {{ t('pagination.shown', { from, to, total }) }}
            </template>
            <template v-else>{{ t('pagination.empty') }}</template>
        </p>

        <div v-if="pages > 1" class="tm-pagination__pages">
            <button
                type="button" class="tm-pagination__step"
                :disabled="page <= 1"
                :aria-label="t('pagination.previous')" :title="t('pagination.previous')"
                @click="emit('update:page', page - 1)"
            >
                <Icon name="chevron-left" :size="16" />
            </button>

            <template v-for="(slot, index) in slots" :key="`${slot}-${index}`">
                <span v-if="slot === 'gap'" class="tm-pagination__gap" aria-hidden="true">…</span>
                <button
                    v-else
                    type="button" class="tm-pagination__page"
                    :class="{ 'is-current': slot === page }"
                    :aria-current="slot === page ? 'page' : undefined"
                    :aria-label="t('pagination.page', { n: slot })"
                    @click="slot !== page && emit('update:page', slot)"
                >
                    {{ slot }}
                </button>
            </template>

            <button
                type="button" class="tm-pagination__step"
                :disabled="page >= pages"
                :aria-label="t('pagination.next')" :title="t('pagination.next')"
                @click="emit('update:page', page + 1)"
            >
                <Icon name="chevron-right" :size="16" />
            </button>
        </div>

        <label class="tm-pagination__size">
            <span>{{ t('pagination.perPage') }}</span>
            <select :value="perPage" @change="emit('update:perPage', Number(($event.target as HTMLSelectElement).value))">
                <option v-for="size in perPageOptions" :key="size" :value="size">{{ size }}</option>
            </select>
        </label>
    </nav>
</template>

<script setup lang="ts">
import { PER_PAGE_OPTIONS } from '~/shared/contracts/pagination'
import { paginationSlots } from './Pagination.config'
import type { IPaginationEmits, IPaginationProps } from './Pagination.d'

const props = withDefaults(defineProps<IPaginationProps>(), { perPageOptions: () => PER_PAGE_OPTIONS })

const emit = defineEmits<IPaginationEmits>()

const { t } = useI18n()

const from = computed(() => (props.total ? (props.page - 1) * props.perPage + 1 : 0))
const to = computed(() => Math.min(props.total, props.page * props.perPage))
const slots = computed(() => paginationSlots(props.page, props.pages))
</script>

<style lang="scss">
@use './_pagination.scss';
</style>
