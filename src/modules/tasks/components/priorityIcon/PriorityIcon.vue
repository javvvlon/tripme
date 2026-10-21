<template>
    <svg
        class="tm-priority-icon" :class="`is-${priority}`"
        :width="size ?? 16" :height="size ?? 16" viewBox="0 0 16 16"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        role="img" :aria-label="t(`cms.tasks.priority.${priority}`)"
    >
        <title>{{ t(`cms.tasks.priority.${priority}`) }}</title>
        <template v-if="priority === 'urgent'">
            <path d="M3.5 8 8 4l4.5 4" />
            <path d="M3.5 12.5 8 8.5l4.5 4" />
        </template>
        <path v-else-if="priority === 'high'" d="M3.5 10.5 8 6l4.5 4.5" />
        <template v-else-if="priority === 'medium'">
            <path d="M3.5 6h9" />
            <path d="M3.5 10h9" />
        </template>
        <path v-else d="M3.5 5.5 8 10l4.5-4.5" />
    </svg>
</template>

<script setup lang="ts">
import type { IPriorityIconProps } from './PriorityIcon.d'

defineProps<IPriorityIconProps>()

const { t } = useI18n()
</script>

<style lang="scss">
.tm-priority-icon {
    flex: none;

    &.is-urgent { color: #C9372C; }
    &.is-high { color: #E5534B; }
    &.is-medium { color: #C98A00; }
    &.is-low { color: #5B7290; }
}
</style>
