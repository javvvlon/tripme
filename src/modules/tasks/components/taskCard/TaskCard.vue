<template>
    <NuxtLink :to="localePath(`/app/tasks/${task.uuid}`)" class="tm-task-card" :class="{ 'is-done': task.status === 'done' }">
        <span class="tm-task-card__title">{{ task.title }}</span>

        <span v-if="task.labels.length" class="tm-task-card__labels">
            <span v-for="label in task.labels" :key="label" class="tm-task-card__label">{{ label }}</span>
        </span>

        <span v-if="task.due_on" class="tm-task-card__due" :class="{ 'is-late': task.overdue }">
            <Icon name="calendar" :size="12" :stroke="2" />{{ dueLabel(task.due_on, locale) }}
        </span>

        <span class="tm-task-card__foot">
            <span class="tm-task-card__type" aria-hidden="true"><Icon name="check" :size="10" :stroke="3.2" /></span>
            <span class="tm-task-card__key">{{ task.key }}</span>
            <span class="tm-task-card__spacer" />
            <Tooltip v-if="task.comments" :text="t('cms.tasks.tabs.comments')" class="tm-task-card__comments">
                <Icon name="mail" :size="13" />{{ task.comments }}
            </Tooltip>
            <PriorityIcon :priority="task.priority" />
            <TaskAvatar :person="task.assignee" size="sm" />
        </span>
    </NuxtLink>
</template>

<script setup lang="ts">
import PriorityIcon from '~/modules/tasks/components/priorityIcon/PriorityIcon.vue'
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
import { dueLabel } from '~/modules/tasks/helpers'
import type { ITaskCardProps } from './TaskCard.d'

defineProps<ITaskCardProps>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-task-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 12px 10px;
    border-radius: 8px;
    background: #FFFFFF;
    box-shadow: 0 1px 1px rgba(11, 25, 44, .2), 0 0 1px rgba(11, 25, 44, .28);
    color: var(--tm-ink-1);
    text-decoration: none;
    cursor: grab;
    transition: background .15s ease, box-shadow .15s ease;

    &:hover { background: #F7F8F9; }

    &:active { cursor: grabbing; }

    &:focus-visible {
        outline: 2px solid #0B192C;
        outline-offset: 2px;
    }

    &__title {
        font-size: size(14);
        line-height: 1.4;
        overflow-wrap: anywhere;
    }

    &__labels {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    &__label {
        padding: 0 6px;
        border-radius: 4px;
        background: #EEF0F3;
        color: #44546F;
        font-size: size(11);
        font-weight: 600;
        line-height: 18px;
    }

    &__due {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        gap: 4px;
        padding: 0 6px;
        border: 1px solid rgba(11, 25, 44, .14);
        border-radius: 4px;
        color: #44546F;
        font-size: size(12);
        font-weight: 600;
        line-height: 20px;

        &.is-late {
            border-color: transparent;
            background: #FFECEB;
            color: #AE2E24;
        }
    }

    &__foot {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 24px;
    }

    &__type {
        display: inline-grid;
        flex: none;
        place-items: center;
        width: 16px;
        height: 16px;
        border-radius: 3px;
        background: #0B192C;
        color: #FFFFFF;
    }

    &__key {
        color: #44546F;
        font-size: size(12);
        font-weight: 600;
        white-space: nowrap;
    }

    &.is-done &__key { text-decoration: line-through; }

    &__spacer { flex: 1; }

    &__comments {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        color: #626F86;
        font-size: size(12);
    }
}
</style>
