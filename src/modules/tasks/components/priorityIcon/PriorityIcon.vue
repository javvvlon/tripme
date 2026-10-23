<template>
    <span
        v-if="MARKS[priority]"
        class="tm-priority-mark" :class="`is-${priority}`"
        role="img" :aria-label="t(`cms.tasks.priority.${priority}`)" :title="t(`cms.tasks.priority.${priority}`)"
    >{{ MARKS[priority] }}</span>
</template>

<script setup lang="ts">
import type { TaskPriority } from '~/modules/tasks/contracts/tasks'
import type { IPriorityIconProps } from './PriorityIcon.d'

const MARKS: Record<TaskPriority, string> = { urgent: '!!!', high: '!!', medium: '!', low: '' }

defineProps<IPriorityIconProps>()

const { t } = useI18n()
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-priority-mark {
    flex: none;
    color: #8590A2;
    font-size: size(14);
    font-weight: 700;
    letter-spacing: -.04em;
    line-height: 1;

    &.is-urgent,
    &.is-high { color: #C9372C; }
}
</style>
