<template>
    <div class="tm-board">
        <header class="tm-board__head">
            <h1 class="tm-board__title">{{ t(`cms.tasks.heading.${view}`) }}</h1>
            <p class="tm-board__summary">{{ summary }}</p>
        </header>

        <div class="tm-board__toolbar">
            <div class="tm-board__filters" role="tablist" :aria-label="t('cms.tasks.filters.label')">
                <button
                    v-for="item in TASK_FILTERS" :key="item"
                    type="button" role="tab" class="tm-board__filter" :class="{ 'is-on': filter === item }"
                    :aria-selected="filter === item"
                    @click="filter = item"
                >
                    {{ t(`cms.tasks.filters.${item}`) }}
                    <span v-if="item === 'late' && late" class="tm-board__filter-count">{{ late }}</span>
                </button>
            </div>

            <SelectMenu v-if="elevated && view !== 'mine'" v-model="assignee" :options="personOptions" size="sm" class="tm-board__person" />

            <button v-if="filtered" type="button" class="tm-board__clear" @click="clear">{{ t('cms.tasks.filters.clear') }}</button>

            <label class="tm-board__search">
                <Icon name="search" :size="15" />
                <input v-model="query" type="search" :placeholder="t('cms.tasks.searchPlaceholder')" :aria-label="t('cms.tasks.search')">
            </label>
        </div>

        <EditorSkeleton v-if="status === 'pending' && !tasks.length" variant="rows" />

        <div v-else-if="view === 'board'" class="tm-board__columns">
            <section
                v-for="column in columns" :key="column.status"
                class="tm-board__column" :class="[`is-${column.status}`, { 'is-over': over === column.status }]"
                :aria-label="t(`cms.tasks.status.${column.status}`)"
                @dragover.prevent="over = column.status"
                @dragleave.self="over = over === column.status ? null : over"
                @drop.prevent="drop(column.status)"
            >
                <h2 class="tm-board__column-head">
                    {{ t(`cms.tasks.status.${column.status}`) }}
                    <span class="tm-board__column-count">{{ column.items.length }}</span>
                </h2>

                <div class="tm-board__cards">
                    <TaskCard
                        v-for="task in column.items" :key="task.uuid"
                        :task="task"
                        draggable="true"
                        @dragstart="dragging = task"
                        @dragend="dragging = null; over = null"
                    />
                </div>

                <button type="button" class="tm-board__add" @click="start(column.status)">
                    <Icon name="plus" :size="14" :stroke="2.2" />{{ t('cms.tasks.addHere') }}
                </button>
            </section>
        </div>

        <template v-else>
            <div v-if="!visible.length" class="tm-board__empty">
                <p>{{ emptyText }}</p>
                <button v-if="filtered" type="button" class="tm-board__clear" @click="clear">{{ t('cms.tasks.filters.clear') }}</button>
            </div>

            <div v-else class="tm-board__table-wrap">
                <table class="tm-board__table">
                    <thead>
                        <tr>
                            <th scope="col" class="is-task">{{ t('cms.tasks.columns.task') }}</th>
                            <th scope="col" class="is-status">{{ t('cms.tasks.columns.status') }}</th>
                            <th scope="col" class="is-owner">{{ t('cms.tasks.columns.assignee') }}</th>
                            <th scope="col" class="is-due">{{ t('cms.tasks.columns.due') }}</th>
                            <th scope="col" class="is-key">{{ t('cms.tasks.columns.key') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="task in visible" :key="task.uuid" class="tm-board__row" :class="{ 'is-done': task.status === 'done' }" @click="open(task)">
                            <td class="is-task">
                                <PriorityIcon v-if="task.priority === 'urgent' || task.priority === 'high'" :priority="task.priority" class="tm-board__marks" />
                                <NuxtLink :to="localePath(`/app/tasks/${task.uuid}`)" class="tm-board__link" @click.stop>{{ task.title }}</NuxtLink>
                                <span v-for="label in task.labels" :key="label" class="tm-board__label">#{{ label }}</span>
                            </td>
                            <td class="is-status"><StatusLozenge :status="task.status" /></td>
                            <td class="is-owner">
                                <span class="tm-board__owner">
                                    <TaskAvatar :person="task.assignee" size="sm" />
                                    <span>{{ task.assignee?.name ?? t('cms.tasks.unassigned') }}</span>
                                </span>
                            </td>
                            <td class="is-due" :class="{ 'is-late': task.overdue }">{{ task.due_on ? dueWord(task.due_on, locale, t) : '—' }}</td>
                            <td class="is-key">{{ task.key }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import TaskCard from '~/modules/tasks/components/taskCard/TaskCard.vue'
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import PriorityIcon from '~/modules/tasks/components/priorityIcon/PriorityIcon.vue'
import StatusLozenge from '~/modules/tasks/components/statusLozenge/StatusLozenge.vue'
import { dueWord } from '~/modules/tasks/helpers'
import { useTaskComposer } from '~/modules/tasks/hooks/use-task-composer'
import { TASK_FILTERS, useTasks } from './Tasks.hooks'
import type { ITask, TaskStatus } from '~/modules/tasks/contracts/tasks'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { start } = useTaskComposer()

const { view, filter, assignee, query, tasks, visible, status, columns, open: openCount, late, personOptions, filtered, clear, move, elevated } = useTasks()

const dragging = ref<ITask | null>(null)
const over = ref<TaskStatus | null>(null)

const summary = computed(() => {
    if (view.value === 'archive') return t('cms.tasks.summary.archived', tasks.value.length)

    return [
        t('cms.tasks.summary.open', openCount.value),
        late.value ? t('cms.tasks.summary.late', late.value) : '',
    ].filter(Boolean).join(' · ')
})

const emptyText = computed(() => {
    if (filtered.value) return t('cms.tasks.noMatches')

    return view.value === 'archive' ? t('cms.tasks.emptyArchive') : view.value === 'mine' ? t('cms.tasks.emptyMine') : t('cms.tasks.empty')
})

function drop(target: TaskStatus) {
    const task = dragging.value

    over.value = null
    dragging.value = null

    if (task) void move(task, target)
}

const open = (task: ITask) => navigateTo(localePath(`/app/tasks/${task.uuid}`))

useSeoMeta({ title: () => t(`cms.tasks.heading.${view.value}`), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_tasks.scss';
</style>
