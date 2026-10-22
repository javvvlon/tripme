<template>
    <div class="tm-register">
        <nav class="tm-register__crumbs" :aria-label="t('common.breadcrumbs')">
            <NuxtLink :to="localePath('/app/tasks')">{{ t('cms.tasks.app') }}</NuxtLink>
            <span aria-hidden="true">/</span>
            <span>{{ t('cms.tasks.notes.nav') }}</span>
        </nav>

        <header class="tm-register__head">
            <div class="tm-register__heading">
                <p class="tm-register__eyebrow">{{ t('cms.tasks.notes.eyebrow') }}</p>
                <h1 class="tm-register__title">{{ t('cms.tasks.notes.title') }}</h1>
                <p class="tm-register__lead">{{ t('cms.tasks.notes.lead') }}</p>
            </div>
            <Button icon="plus" size="sm" class="tm-register__create" @click="start(createKind)">{{ t('cms.tasks.notes.create') }}</Button>
        </header>

        <div class="tm-register__toolbar">
            <Tabs v-model="filter" :items="filterItems" variant="segment" :aria-label="t('cms.tasks.notes.title')" />
            <label class="tm-register__search">
                <Icon name="search" :size="16" />
                <input v-model="query" type="search" :placeholder="t('cms.tasks.notes.searchPlaceholder')" :aria-label="t('cms.tasks.notes.search')">
            </label>
        </div>

        <EditorSkeleton v-if="status === 'pending' && !notes.length" variant="rows" />

        <div v-else-if="!notes.length" class="tm-register__empty">
            <p>{{ emptyText }}</p>
            <Button v-if="!search && filter !== 'archive'" icon="plus" size="sm" variant="secondary" @click="start(createKind)">{{ t('cms.tasks.notes.create') }}</Button>
        </div>

        <div v-else class="tm-register__sheet">
            <div class="tm-register__row is-head" aria-hidden="true">
                <span />
                <span>{{ t('cms.tasks.notes.columns.key') }}</span>
                <span>{{ t('cms.tasks.notes.columns.record') }}</span>
                <span class="is-author">{{ t('cms.tasks.notes.columns.author') }}</span>
                <span class="is-date">{{ t('cms.tasks.notes.columns.date') }}</span>
                <span class="is-state">{{ t('cms.tasks.notes.columns.status') }}</span>
            </div>

            <NuxtLink
                v-for="note in notes" :key="note.uuid"
                :to="localePath(`/app/tasks/notes/${note.uuid}`)"
                class="tm-register__row" :class="[`is-${note.kind}`, { 'is-faded': note.archived_at || note.superseded_by, 'is-mine': note.acks?.mine === 'pending' }]"
            >
                <span class="tm-register__rule" aria-hidden="true" />
                <span class="tm-register__key">{{ note.key }}</span>
                <span class="tm-register__record">
                    <span class="tm-register__kind">{{ t(`cms.tasks.notes.kinds.${note.kind}`) }}</span>
                    <span class="tm-register__name">{{ note.title }}</span>
                    <span v-if="note.excerpt" class="tm-register__excerpt">{{ note.excerpt }}</span>
                </span>
                <span class="tm-register__author is-author">
                    <TaskAvatar :person="note.author" size="sm" />
                    <span>{{ note.author?.name ?? '—' }}</span>
                </span>
                <span class="tm-register__date is-date">{{ registerDate(note.created_at, locale) }}</span>
                <span class="tm-register__state is-state">
                    <template v-if="note.acks && !note.archived_at && !note.superseded_by">
                        <span class="tm-register__acks" :title="t('cms.tasks.notes.sheetProgress', { done: note.acks.done, total: note.acks.total })">
                            <span class="tm-register__acks-bar"><span :style="{ width: `${share(note.acks)}%` }" /></span>
                            <span class="tm-register__acks-count">{{ note.acks.done }}/{{ note.acks.total }}</span>
                        </span>
                    </template>
                    <NoteStamp v-if="noteTone(note)" :tone="noteTone(note)!" />
                    <span v-else class="tm-register__dash">—</span>
                </span>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import NoteStamp from '~/modules/tasks/components/noteStamp/NoteStamp.vue'
import { noteTone, registerDate } from '~/modules/tasks/helpers'
import { useNoteComposer } from '~/modules/tasks/hooks/use-note-composer'
import { useNotes } from './Notes.hooks'
import type { INoteAcks, NoteKind } from '~/modules/tasks/contracts/notes'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { start } = useNoteComposer()

const { FILTERS, filter, query, search, notes, status } = useNotes()

const filterItems = computed(() => FILTERS.map(value => ({ value, label: t(`cms.tasks.notes.filters.${value}`) })))

const createKind = computed<NoteKind>(() => (filter.value === 'decision' || filter.value === 'directive' ? filter.value : 'note'))

const emptyText = computed(() => (search.value ? t('cms.tasks.notes.noMatches') : filter.value === 'archive' ? t('cms.tasks.notes.emptyArchive') : t('cms.tasks.notes.empty')))

const share = (acks: INoteAcks) => (acks.total ? Math.round((acks.done / acks.total) * 100) : 0)

useSeoMeta({ title: () => t('cms.tasks.notes.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_notes.scss';
</style>
