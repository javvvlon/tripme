<template>
    <div class="tm-issue">
        <nav class="tm-issue__crumbs" :aria-label="t('common.breadcrumbs')">
            <NuxtLink :to="localePath('/app/tasks')">{{ t('cms.tasks.app') }}</NuxtLink>
            <span aria-hidden="true">/</span>
            <span class="tm-issue__crumb-key">
                <span class="tm-issue__type" aria-hidden="true"><Icon name="check" :size="10" :stroke="3.2" /></span>{{ task?.key ?? '…' }}
            </span>
        </nav>

        <EditorSkeleton v-if="status === 'pending' && !task" variant="form" />

        <p v-else-if="!task" class="tm-issue__missing">{{ t('cms.tasks.missing') }}</p>

        <div v-else class="tm-issue__layout">
            <div class="tm-issue__main">
                <input
                    v-model="title"
                    class="tm-issue__title"
                    :aria-label="t('cms.tasks.fields.title')"
                    :disabled="locked"
                    maxlength="200"
                    @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
                    @keydown.esc="title = task.title; ($event.target as HTMLInputElement).blur()"
                    @blur="saveTitle"
                >

                <section v-if="task.archived_at" class="tm-issue__archived" role="status">
                    <Icon name="folder" :size="18" />
                    <span>{{ t('cms.tasks.archived') }}</span>
                    <Button type="button" size="sm" variant="secondary" icon="undo" @click="toggleArchive">{{ t('cms.tasks.restore') }}</Button>
                </section>

                <section class="tm-issue__section">
                    <h2 class="tm-issue__heading">{{ t('cms.tasks.fields.description') }}</h2>

                    <div v-if="editing" class="tm-issue__editing" @keydown.meta.enter.prevent="saveDescription" @keydown.ctrl.enter.prevent="saveDescription">
                        <RichEditor v-model="description" :placeholder="t('cms.tasks.fields.descriptionPlaceholder')" class="tm-issue__editor" />
                        <div class="tm-issue__edit-actions">
                            <Button size="sm" :loading="saving" @click="saveDescription">{{ t('common.save') }}</Button>
                            <Button size="sm" variant="ghost" @click="editing = false">{{ t('common.cancel') }}</Button>
                        </div>
                    </div>

                    <div
                        v-else
                        class="tm-issue__description" :class="{ 'is-locked': locked }"
                        :role="locked ? undefined : 'button'" :tabindex="locked ? undefined : 0"
                        :aria-label="locked ? undefined : t('cms.tasks.editDescription')"
                        @click="startEditing" @keydown.enter.prevent="startEditing"
                    >
                        <RichText v-if="task.description" :body="task.description" />
                        <p v-else class="tm-issue__placeholder">{{ t('cms.tasks.addDescription') }}</p>
                    </div>
                </section>

                <section class="tm-issue__section">
                    <h2 class="tm-issue__heading">{{ t('cms.tasks.activity') }}</h2>

                    <div class="tm-issue__tabs" role="tablist" :aria-label="t('cms.tasks.activity')">
                        <span class="tm-issue__tabs-label">{{ t('cms.tasks.tabs.show') }}</span>
                        <button
                            v-for="item in TABS" :key="item"
                            type="button" role="tab" class="tm-issue__tab" :class="{ 'is-active': tab === item }"
                            :aria-selected="tab === item"
                            @click="tab = item"
                        >
                            {{ t(`cms.tasks.tabs.${item}`) }}
                        </button>
                    </div>

                    <div v-if="tab !== 'history' && !locked" class="tm-issue__composer">
                        <TaskAvatar :person="mePerson" />
                        <div v-if="writing" class="tm-issue__composer-body" @keydown.meta.enter.prevent="submit" @keydown.ctrl.enter.prevent="submit">
                            <RichEditor v-model="draft" compact :placeholder="t('cms.tasks.commentPlaceholder')" class="tm-issue__editor is-comment" />
                            <div class="tm-issue__edit-actions">
                                <Button size="sm" :loading="sending" :disabled="!draft.trim()" @click="submit">{{ t('common.save') }}</Button>
                                <Button size="sm" variant="ghost" @click="writing = false; draft = ''">{{ t('common.cancel') }}</Button>
                            </div>
                        </div>
                        <button v-else type="button" class="tm-issue__composer-stub" @click="writing = true">{{ t('cms.tasks.addComment') }}</button>
                    </div>

                    <ol class="tm-issue__feed">
                        <li v-for="event in feed" :key="event.uuid" class="tm-issue__event" :class="`is-${event.kind}`">
                            <TaskAvatar :person="event.actor" />
                            <div class="tm-issue__event-main">
                                <p class="tm-issue__event-head">
                                    <strong>{{ event.actor?.name ?? t('cms.tasks.system') }}</strong>
                                    <time :datetime="event.at">{{ when(event.at) }}</time>
                                </p>
                                <RichText v-if="event.kind === 'comment'" :body="event.body" class="tm-issue__comment" />
                                <p v-else-if="event.kind === 'status' && event.from && event.to" class="tm-issue__change">
                                    {{ t('cms.tasks.fields.status') }}:
                                    <StatusLozenge :status="event.from as TaskStatus" />
                                    <Icon name="arrow-right" :size="14" />
                                    <StatusLozenge :status="event.to as TaskStatus" />
                                </p>
                                <p v-else class="tm-issue__change">{{ describe(event) }}</p>
                            </div>
                        </li>
                        <li v-if="!feed.length" class="tm-issue__quiet">{{ t('cms.tasks.noComments') }}</li>
                    </ol>
                </section>
            </div>

            <aside class="tm-issue__side">
                <div class="tm-issue__actions">
                    <SelectMenu
                        :model-value="task.status" :options="statusOptions" :tone="`task-${task.status}`"
                        size="md" :disabled="saving || locked"
                        class="tm-issue__status"
                        @update:model-value="save({ status: $event as TaskStatus })"
                    />
                    <MoreMenu :label="t('cms.more')" :items="moreItems" @select="toggleArchive" />
                </div>

                <section class="tm-issue__details">
                    <h2 class="tm-issue__details-title">{{ t('cms.tasks.details') }}</h2>

                    <dl class="tm-issue__facts">
                        <div class="tm-issue__fact">
                            <dt>{{ t('cms.tasks.fields.assignee') }}</dt>
                            <dd>
                                <Combobox
                                    v-if="elevated"
                                    :model-value="task.assignee?.uuid ?? ''"
                                    variant="field"
                                    :label="t('cms.tasks.fields.assignee')"
                                    :options="assignOptions"
                                    :placeholder="t('cms.tasks.unassigned')"
                                    clearable
                                    menu-align="end"
                                    :disabled="saving || locked"
                                    @update:model-value="save({ assignee_id: $event || null })"
                                />
                                <span v-else class="tm-issue__person"><TaskAvatar :person="task.assignee" size="sm" />{{ task.assignee?.name ?? t('cms.tasks.unassigned') }}</span>
                                <button
                                    v-if="!locked && task.assignee?.uuid !== me"
                                    type="button" class="tm-issue__assign-me"
                                    @click="save({ assignee_id: me })"
                                >
                                    {{ t('cms.tasks.assignMe') }}
                                </button>
                            </dd>
                        </div>
                        <div class="tm-issue__fact">
                            <dt>{{ t('cms.tasks.fields.author') }}</dt>
                            <dd><span class="tm-issue__person"><TaskAvatar :person="task.author" size="sm" />{{ task.author?.name ?? '—' }}</span></dd>
                        </div>
                        <div class="tm-issue__fact">
                            <dt>{{ t('cms.tasks.fields.priority') }}</dt>
                            <dd class="tm-issue__priority">
                                <PriorityIcon :priority="task.priority" />
                                <SelectMenu
                                    :model-value="task.priority" :options="priorityOptions"
                                    size="md" :disabled="saving || locked"
                                    @update:model-value="save({ priority: $event as TaskPriority })"
                                />
                            </dd>
                        </div>
                        <div class="tm-issue__fact">
                            <dt>{{ t('cms.tasks.fields.due') }}</dt>
                            <dd>
                                <Input
                                    :model-value="task.due_on ?? ''" type="date"
                                    :label="t('cms.tasks.fields.due')"
                                    :disabled="saving || locked"
                                    class="tm-issue__due" :class="{ 'is-late': task.overdue }"
                                    @update:model-value="save({ due_on: String($event) || null })"
                                />
                            </dd>
                        </div>
                        <div class="tm-issue__fact">
                            <dt>{{ t('cms.tasks.fields.labels') }}</dt>
                            <dd>
                                <Input
                                    v-model="labels"
                                    :label="t('cms.tasks.fields.labels')"
                                    :placeholder="t('cms.tasks.fields.labelsHint')"
                                    :disabled="locked"
                                    @blur="saveLabels"
                                    @keydown.enter.prevent="saveLabels"
                                />
                            </dd>
                        </div>
                    </dl>
                </section>

                <p class="tm-issue__meta">
                    <span>{{ t('cms.tasks.fields.created') }} {{ when(task.created_at) }}</span>
                    <span>{{ t('cms.tasks.fields.updated') }} {{ when(task.updated_at) }}</span>
                </p>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import MoreMenu from '~/shared/components/moreMenu/MoreMenu.vue'
import RichEditor from '~/shared/components/richEditor/RichEditor.vue'
import RichText from '~/shared/components/richText/RichText.vue'
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import PriorityIcon from '~/modules/tasks/components/priorityIcon/PriorityIcon.vue'
import StatusLozenge from '~/modules/tasks/components/statusLozenge/StatusLozenge.vue'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { dueLabel, labelsOf } from '~/modules/tasks/helpers'
import { TASK_PRIORITIES, TASK_STATUSES } from '~/modules/tasks/contracts/tasks'
import type { ITaskEvent, TaskPriority, TaskStatus } from '~/modules/tasks/contracts/tasks'
import { useTask } from './Task.hooks'

const TABS = ['comments', 'history', 'all'] as const

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { user } = useAuthSession()

const { task, status, saving, sending, save, send, toggleArchive, elevated, me, assignOptions, nameOf } = useTask()

const title = ref('')
const description = ref('')
const labels = ref('')
const draft = ref('')
const editing = ref(false)
const writing = ref(false)
const tab = ref<typeof TABS[number]>('comments')

const locked = computed(() => Boolean(task.value?.archived_at))

const mePerson = computed(() => (user.value ? { uuid: String(user.value.get('id')), name: user.value.fullName() } : null))

watch(task, (value) => {
    title.value = value?.title ?? ''
    labels.value = (value?.labels ?? []).join(', ')
}, { immediate: true })

const feed = computed(() => {
    const events = [...(task.value?.events ?? [])].reverse()

    if (tab.value === 'comments') return events.filter(event => event.kind === 'comment')
    if (tab.value === 'history') return events.filter(event => event.kind !== 'comment')

    return events
})

const statusOptions = computed(() => TASK_STATUSES.map(value => ({ value, label: t(`cms.tasks.status.${value}`) })))

const priorityOptions = computed(() => TASK_PRIORITIES.map(value => ({ value, label: t(`cms.tasks.priority.${value}`) })))

const moreItems = computed(() => [
    task.value?.archived_at
        ? { key: 'restore', label: t('cms.tasks.restore'), icon: 'undo' }
        : { key: 'archive', label: t('cms.tasks.archive'), icon: 'folder' },
])

const startEditing = () => {
    if (locked.value || !task.value) return

    description.value = task.value.description
    editing.value = true
}

const saveTitle = () => {
    const next = title.value.trim()

    if (!task.value || !next || next === task.value.title) {
        title.value = task.value?.title ?? ''

        return
    }

    void save({ title: next })
}

async function saveDescription() {
    if (task.value && description.value !== task.value.description) await save({ description: description.value })

    editing.value = false
}

const saveLabels = () => {
    const next = labelsOf(labels.value)

    if (task.value && next.join(',') !== task.value.labels.join(',')) void save({ labels: next })
}

async function submit() {
    if (!(await send(draft.value))) return

    draft.value = ''
    writing.value = false
}

const when = (iso: string) =>
    new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

const statusName = (value: string | null) => (value ? t(`cms.tasks.status.${value}`) : '—')

const priorityName = (value: string | null) => (value ? t(`cms.tasks.priority.${value}`) : '—')

const dayName = (value: string | null) => (value ? dueLabel(value, locale.value) : t('cms.tasks.noDue'))

function describe(event: ITaskEvent): string {
    switch (event.kind) {
        case 'created':
            return t('cms.tasks.events.created', { status: statusName(event.to) })
        case 'status':
            return t('cms.tasks.events.status', { from: statusName(event.from), to: statusName(event.to) })
        case 'assigned':
            return t('cms.tasks.events.assigned', { from: nameOf(event.from) || t('cms.tasks.unassigned'), to: nameOf(event.to) || t('cms.tasks.unassigned') })
        case 'priority':
            return t('cms.tasks.events.priority', { from: priorityName(event.from), to: priorityName(event.to) })
        case 'due':
            return t('cms.tasks.events.due', { from: dayName(event.from), to: dayName(event.to) })
        case 'title':
            return t('cms.tasks.events.title', { to: event.to ?? '' })
        case 'archived':
            return t('cms.tasks.events.archived')
        case 'restored':
            return t('cms.tasks.events.restored')
        default:
            return ''
    }
}

useSeoMeta({ title: () => (task.value ? `${task.value.key} ${task.value.title}` : t('cms.tasks.app')), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_task.scss';
</style>
