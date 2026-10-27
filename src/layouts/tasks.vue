<template>
    <div class="tm-jira">
        <header class="tm-jira__top">
            <NuxtLink :to="localePath('/app/tasks')" class="tm-jira__brand" :aria-label="`${BRAND_NAME} ${t('cms.tasks.app')}`">
                <Logo variant="mark" :width="20" />
                <span class="tm-jira__brand-name">{{ BRAND_NAME }} <span>{{ t('cms.tasks.app') }}</span></span>
            </NuxtLink>

            <nav class="tm-jira__nav" :aria-label="t('cms.tasks.app')">
                <NuxtLink
                    v-for="item in NAV" :key="item.view"
                    :to="{ path: localePath('/app/tasks'), query: item.view === 'board' ? {} : { view: item.view } }"
                    class="tm-jira__link" :class="{ 'is-active': current === item.view }"
                    :aria-current="current === item.view ? 'page' : undefined"
                >
                    <span class="tm-jira__link-inner">
                        <Icon :name="item.icon" :size="16" />
                        {{ t(`cms.tasks.views.${item.view}`) }}
                        <span v-if="item.view === 'mine' && summary.open" class="tm-jira__count">{{ summary.open }}</span>
                    </span>
                </NuxtLink>
                <NuxtLink
                    :to="localePath('/app/tasks/notes')"
                    class="tm-jira__link" :class="{ 'is-active': onNotes }"
                    :aria-current="onNotes ? 'page' : undefined"
                >
                    <span class="tm-jira__link-inner">
                        <Icon name="doc" :size="16" />
                        {{ t('cms.tasks.notes.nav') }}
                        <span v-if="pending.length" class="tm-jira__count is-alert">{{ pending.length }}</span>
                    </span>
                </NuxtLink>
                <NuxtLink
                    :to="{ path: localePath('/app/tasks'), query: { view: 'archive' } }"
                    class="tm-jira__link" :class="{ 'is-active': current === 'archive' }"
                    :aria-current="current === 'archive' ? 'page' : undefined"
                >
                    <span class="tm-jira__link-inner">
                        <Icon name="folder" :size="16" />
                        {{ t('cms.tasks.views.archive') }}
                    </span>
                </NuxtLink>
            </nav>

            <Tooltip v-slot="{ tipId }" :text="t('cms.tasks.composer.shortcut')" side="bottom" class="tm-jira__create">
                <Button icon="plus" size="sm" :aria-describedby="tipId" @click="create">
                    {{ t('cms.tasks.create') }}
                </Button>
            </Tooltip>

            <div ref="menuRoot" class="tm-jira__user">
                <button
                    type="button" class="tm-jira__user-button"
                    aria-haspopup="menu" :aria-expanded="menuOpen"
                    @click="menuOpen = !menuOpen"
                >
                    <TaskAvatar :person="person" />
                    <span class="tm-jira__user-name">{{ person?.name }}</span>
                    <Icon name="chevron" :size="14" :stroke="2.2" class="tm-jira__user-caret" />
                </button>

                <div v-if="menuOpen" class="tm-jira__menu" role="menu">
                    <div class="tm-jira__menu-head">
                        <TaskAvatar :person="person" size="lg" />
                        <div class="tm-jira__menu-who">
                            <strong>{{ person?.name }}</strong>
                            <span>{{ user?.get('email') }}</span>
                            <span v-if="roleLabel" class="tm-jira__menu-role">{{ roleLabel }}</span>
                        </div>
                    </div>
                    <button type="button" role="menuitem" class="tm-jira__menu-item" @click="signOut">
                        <Icon name="logout" :size="16" />{{ t('common.logout') }}
                    </button>
                </div>
            </div>
        </header>

        <NuxtLink
            v-if="banner"
            :to="localePath(`/app/tasks/notes/${banner.uuid}`)"
            class="tm-jira__directive"
        >
            <span class="tm-jira__directive-label">{{ t('cms.tasks.notes.banner.label') }}</span>
            <span class="tm-jira__directive-key">{{ banner.key }}</span>
            <span class="tm-jira__directive-title">{{ banner.title }}</span>
            <span v-if="pending.length > 1" class="tm-jira__directive-more">{{ t('cms.tasks.notes.banner.more', { n: pending.length - 1 }) }}</span>
            <span class="tm-jira__directive-action">{{ t('cms.tasks.notes.banner.action') }}<Icon name="arrow-right" :size="14" /></span>
        </NuxtLink>

        <main class="tm-jira__main">
            <slot />
        </main>

        <TaskComposer />
        <NoteComposer />
        <ConfirmDialog />
        <ModalHost />
        <ToastHost />
    </div>
</template>

<script setup lang="ts">
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import TaskComposer from '~/modules/tasks/components/taskComposer/TaskComposer.vue'
import NoteComposer from '~/modules/tasks/components/noteComposer/NoteComposer.vue'
import { BRAND_NAME } from '~/shared/config/brand'
import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useTaskComposer } from '~/modules/tasks/hooks/use-task-composer'
import { useNoteComposer } from '~/modules/tasks/hooks/use-note-composer'
import { useNotesRepository, useTasksRepository } from '~/modules/tasks/repositories'
import { TASK_VIEWS } from '~/modules/tasks/contracts/tasks'
import type { ITaskSummary, TaskView } from '~/modules/tasks/contracts/tasks'
import type { IPendingDirective } from '~/modules/tasks/contracts/notes'

const NAV: { view: TaskView, icon: string }[] = [
    { view: 'board', icon: 'columns' },
    { view: 'list', icon: 'list' },
    { view: 'mine', icon: 'user' },
]

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { user, logout } = useAuthSession()
const { start } = useTaskComposer()
const { start: startNote } = useNoteComposer()
const { summary: loadSummary } = useTasksRepository()
const { pending: loadPending } = useNotesRepository()

const onNotes = computed(() => route.path.startsWith(localePath('/app/tasks/notes')))

const create = () => (onNotes.value ? startNote() : start())

const person = computed(() => (user.value ? { uuid: String(user.value.get('id')), name: user.value.fullName() } : null))

const roleLabel = computed(() => {
    const role = user.value?.get('role')

    return role ? t(`cms.roles.${role}`) : ''
})

const current = computed<TaskView | null>(() => {
    if (route.path !== localePath('/app/tasks')) return null

    const view = String(route.query.view ?? '')

    return (TASK_VIEWS as readonly string[]).includes(view) ? view as TaskView : 'board'
})

const { data: summary, refresh: refreshSummary } = useAsyncData(
    'tasks:summary',
    () => loadSummary(),
    { default: (): ITaskSummary => ({ open: 0, overdue: 0, due_today: 0, review: 0 }) },
)

const { data: pending, refresh: refreshPending } = useAsyncData(
    'notes:pending',
    () => loadPending(),
    { default: (): IPendingDirective[] => [] },
)

const banner = computed(() => pending.value.find(item => route.path !== localePath(`/app/tasks/notes/${item.uuid}`)) ?? null)

watch(() => route.fullPath, () => {
    void refreshSummary()
    void refreshPending()
})

const menuOpen = ref(false)
const menuRoot = useTemplateRef<HTMLElement>('menuRoot')

function onPointer(event: PointerEvent) {
    if (menuOpen.value && !menuRoot.value?.contains(event.target as Node)) menuOpen.value = false
}

function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') menuOpen.value = false

    if (event.key.toLowerCase() !== 'c' || event.metaKey || event.ctrlKey || event.altKey) return

    if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return

    event.preventDefault()
    create()
}

onMounted(() => {
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onPointer)
    window.removeEventListener('keydown', onKey)
})

async function signOut() {
    menuOpen.value = false
    await logout()
    await navigateTo(localePath('/auth'))
}
</script>

<style lang="scss">
@use './_tasks.scss';
</style>
