<template>
    <div class="tm-board">
        <nav class="tm-board__crumbs" :aria-label="t('common.breadcrumbs')">
            <NuxtLink :to="localePath('/app/tasks')">{{ t('cms.tasks.app') }}</NuxtLink>
            <span aria-hidden="true">/</span>
            <span>{{ t(`cms.tasks.views.${view}`) }}</span>
        </nav>

        <h1 class="tm-board__title">{{ t(`cms.tasks.heading.${view}`) }}</h1>

        <div class="tm-board__toolbar">
            <label class="tm-board__search">
                <Icon name="search" :size="16" />
                <input v-model="query" type="search" :placeholder="t('cms.tasks.searchPlaceholder')" :aria-label="t('cms.tasks.search')">
            </label>

            <div v-if="elevated && view !== 'mine'" class="tm-board__people" role="group" :aria-label="t('cms.tasks.filters.people')">
                <button
                    v-for="person in team" :key="person.uuid"
                    type="button" class="tm-board__person" :class="{ 'is-on': selected.includes(person.uuid) }"
                    :aria-pressed="selected.includes(person.uuid)" :aria-label="person.name"
                    @click="toggle(person.uuid)"
                >
                    <TaskAvatar :person="person" />
                </button>
                <button
                    type="button" class="tm-board__person" :class="{ 'is-on': selected.includes(UNASSIGNED) }"
                    :aria-pressed="selected.includes(UNASSIGNED)" :aria-label="t('cms.tasks.filters.unassigned')"
                    @click="toggle(UNASSIGNED)"
                >
                    <TaskAvatar :person="null" />
                </button>
            </div>

            <button type="button" class="tm-board__quick" :class="{ 'is-on': lateOnly }" :aria-pressed="lateOnly" @click="lateOnly = !lateOnly">
                {{ t('cms.tasks.filters.late') }}
            </button>

            <button v-if="filtered" type="button" class="tm-board__clear" @click="clear">{{ t('cms.tasks.filters.clear') }}</button>
        </div>

        <EditorSkeleton v-if="status === 'pending' && !tasks.length" variant="rows" />

        <div v-else-if="view === 'board'" class="tm-board__columns">
            <section
                v-for="column in columns" :key="column.status"
                class="tm-board__column" :class="{ 'is-over': over === column.status }"
                :aria-label="t(`cms.tasks.status.${column.status}`)"
                @dragover.prevent="over = column.status"
                @dragleave.self="over = over === column.status ? null : over"
                @drop.prevent="drop(column.status)"
            >
                <header class="tm-board__column-head">
                    <span class="tm-board__column-title">{{ t(`cms.tasks.status.${column.status}`) }}</span>
                    <span class="tm-board__column-count">{{ column.items.length }}</span>
                    <Icon v-if="column.status === 'done'" name="check" :size="14" :stroke="2.6" class="tm-board__column-done" />
                </header>

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
                    <Icon name="plus" :size="16" :stroke="2.2" />{{ t('cms.tasks.addHere') }}
                </button>
            </section>
        </div>

        <template v-else>
            <ul v-if="view === 'mine'" class="tm-board__stats">
                <li v-for="stat in stats" :key="stat.key" :class="`is-${stat.key}`">
                    <strong>{{ stat.value }}</strong>{{ t(`cms.tasks.stats.${stat.key}`) }}
                </li>
            </ul>

            <div v-if="!visible.length" class="tm-board__empty">
                <p>{{ emptyText }}</p>
                <Button v-if="view !== 'archive' && !filtered" icon="plus" size="sm" @click="start()">{{ t('cms.tasks.create') }}</Button>
            </div>

            <div v-else class="tm-board__table-wrap">
                <table class="tm-board__table">
                    <thead>
                        <tr>
                            <th scope="col" class="is-key">{{ t('cms.tasks.columns.key') }}</th>
                            <th scope="col" class="is-task">{{ t('cms.tasks.columns.task') }}</th>
                            <th scope="col" class="is-status">{{ t('cms.tasks.columns.status') }}</th>
                            <th scope="col" class="is-owner">{{ t('cms.tasks.columns.assignee') }}</th>
                            <th scope="col" class="is-priority">{{ t('cms.tasks.columns.priority') }}</th>
                            <th scope="col" class="is-due">{{ t('cms.tasks.columns.due') }}</th>
                            <th scope="col" class="is-updated">{{ t('cms.tasks.columns.updated') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="task in visible" :key="task.uuid" class="tm-board__row" :class="{ 'is-done': task.status === 'done' }" @click="open(task)">
                            <td class="is-key">
                                <span class="tm-board__key"><span class="tm-board__type" aria-hidden="true"><Icon name="check" :size="10" :stroke="3.2" /></span>{{ task.key }}</span>
                            </td>
                            <td class="is-task">
                                <NuxtLink :to="localePath(`/app/tasks/${task.uuid}`)" class="tm-board__link" @click.stop>{{ task.title }}</NuxtLink>
                                <span v-for="label in task.labels" :key="label" class="tm-board__label">{{ label }}</span>
                            </td>
                            <td class="is-status"><StatusLozenge :status="task.status" /></td>
                            <td class="is-owner">
                                <span class="tm-board__owner">
                                    <TaskAvatar :person="task.assignee" size="sm" />
                                    <span>{{ task.assignee?.name ?? t('cms.tasks.unassigned') }}</span>
                                </span>
                            </td>
                            <td class="is-priority">
                                <span class="tm-board__priority"><PriorityIcon :priority="task.priority" />{{ t(`cms.tasks.priority.${task.priority}`) }}</span>
                            </td>
                            <td class="is-due" :class="{ 'is-late': task.overdue }">{{ task.due_on ? dueLabel(task.due_on, locale) : '—' }}</td>
                            <td class="is-updated">{{ shortDate(task.updated_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import TaskCard from '~/modules/tasks/components/taskCard/TaskCard.vue'
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import PriorityIcon from '~/modules/tasks/components/priorityIcon/PriorityIcon.vue'
import StatusLozenge from '~/modules/tasks/components/statusLozenge/StatusLozenge.vue'
import { dueLabel } from '~/modules/tasks/helpers'
import { useTaskComposer } from '~/modules/tasks/hooks/use-task-composer'
import { useTasks } from './Tasks.hooks'
import type { ITask, ITaskSummary, TaskStatus } from '~/modules/tasks/contracts/tasks'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { start } = useTaskComposer()

const { view, query, tasks, visible, status, columns, team, selected, lateOnly, toggle, filtered, clear, move, elevated, UNASSIGNED } = useTasks()

const { data: summary } = useNuxtData<ITaskSummary>('tasks:summary')

const dragging = ref<ITask | null>(null)
const over = ref<TaskStatus | null>(null)

const stats = computed(() => [
    { key: 'open', value: summary.value?.open ?? 0 },
    { key: 'overdue', value: summary.value?.overdue ?? 0 },
    { key: 'due_today', value: summary.value?.due_today ?? 0 },
    { key: 'review', value: summary.value?.review ?? 0 },
])

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

const shortDate = (iso: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(new Date(iso))

useSeoMeta({ title: () => t(`cms.tasks.heading.${view.value}`), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_tasks.scss';
</style>
