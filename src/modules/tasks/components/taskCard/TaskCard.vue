<template>
    <NuxtLink :to="localePath(`/app/tasks/${task.uuid}`)" class="tm-task-card" :class="{ 'is-done': task.status === 'done' }">
        <span class="tm-task-card__title">
            <PriorityIcon v-if="task.priority === 'urgent' || task.priority === 'high'" :priority="task.priority" class="tm-task-card__marks" />
            {{ task.title }}
        </span>

        <span class="tm-task-card__meta">
            <span>{{ task.key }}</span>
            <span v-if="task.due_on" :class="{ 'is-late': task.overdue }">{{ dueWord(task.due_on, locale, t) }}</span>
            <span v-if="task.assignee" :title="task.assignee.name">{{ initialsOf(task.assignee.name) }}</span>
            <span v-if="task.comments" class="tm-task-card__comments">
                <Icon name="mail" :size="12" />{{ task.comments }}
            </span>
            <span v-for="label in task.labels" :key="label" class="tm-task-card__label">#{{ label }}</span>
        </span>
    </NuxtLink>
</template>

<script setup lang="ts">
import PriorityIcon from '~/modules/tasks/components/priorityIcon/PriorityIcon.vue'
import { dueWord, initialsOf } from '~/modules/tasks/helpers'
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
    gap: 6px;
    padding: 11px 12px;
    border: 1px solid #E1E5EB;
    border-radius: 10px;
    background: #FFFFFF;
    color: #0B192C;
    text-decoration: none;
    cursor: grab;
    transition: border-color .15s ease;

    &:hover { border-color: #B8BFCB; }

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

    &__marks { margin-right: 4px; }

    &__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 2px 0;
        color: #6B7689;
        font-size: size(12);
        font-variant-numeric: tabular-nums;

        > span + span::before {
            content: '·';
            margin: 0 6px;
            color: #B8BFCB;
        }

        .is-late {
            color: #C9372C;
            font-weight: 600;
        }
    }

    &__comments {
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }

    &__label { color: #8590A2; }

    &.is-done {
        border-color: transparent;
        background: transparent;

        .tm-task-card__title { color: #8590A2; }

        &:hover { border-color: #E1E5EB; }
    }
}
</style>
