<template>
    <div class="tm-memo-page">
        <nav class="tm-memo-page__crumbs" :aria-label="t('common.breadcrumbs')">
            <NuxtLink :to="localePath('/app/tasks')">{{ t('cms.tasks.app') }}</NuxtLink>
            <span aria-hidden="true">/</span>
            <NuxtLink :to="localePath('/app/tasks/notes')">{{ t('cms.tasks.notes.nav') }}</NuxtLink>
            <span aria-hidden="true">/</span>
            <span>{{ note?.key ?? '…' }}</span>
        </nav>

        <EditorSkeleton v-if="status === 'pending' && !note" variant="form" />

        <p v-else-if="!note" class="tm-memo-page__missing">{{ t('cms.tasks.notes.missing') }}</p>

        <template v-else>
            <div class="tm-memo-page__actions">
                <Button
                    v-if="note.kind !== 'note' && elevated && live"
                    size="sm" variant="secondary" icon="pencil"
                    @click="start(note.kind, { uuid: note.uuid, key: note.key })"
                >
                    {{ t('cms.tasks.notes.replace') }}
                </Button>
                <MoreMenu v-if="canArchive" :label="t('cms.more')" :items="moreItems" @select="toggleArchive" />
            </div>

            <article class="tm-memo" :class="`is-${note.kind}`">
                <header class="tm-memo__head">
                    <span class="tm-memo__kind">{{ t(`cms.tasks.notes.kinds.${note.kind}`) }}</span>
                    <span class="tm-memo__key">{{ note.key }}</span>
                </header>

                <input
                    v-if="editable"
                    v-model="title"
                    class="tm-memo__title is-input"
                    :aria-label="t('cms.tasks.notes.fields.title')"
                    maxlength="200"
                    @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
                    @blur="saveTitle"
                >
                <h1 v-else class="tm-memo__title">{{ note.title }}</h1>

                <dl class="tm-memo__meta">
                    <div class="tm-memo__fact">
                        <dt>{{ t('cms.tasks.notes.meta.from') }}</dt>
                        <dd class="tm-memo__person"><TaskAvatar :person="note.author" size="sm" />{{ note.author?.name ?? '—' }}</dd>
                    </div>
                    <div v-if="note.kind === 'directive'" class="tm-memo__fact">
                        <dt>{{ t('cms.tasks.notes.meta.to') }}</dt>
                        <dd>{{ audienceLine }}</dd>
                    </div>
                    <div class="tm-memo__fact">
                        <dt>{{ t('cms.tasks.notes.meta.date') }}</dt>
                        <dd class="is-mono">{{ stamp(note.created_at) }}</dd>
                    </div>
                    <div class="tm-memo__fact">
                        <dt>{{ t('cms.tasks.notes.meta.basis') }}</dt>
                        <dd>
                            <input
                                v-if="editable"
                                v-model="refs"
                                class="tm-memo__refs-input"
                                :placeholder="t('cms.tasks.notes.fields.refsExample')"
                                :aria-label="t('cms.tasks.notes.meta.basis')"
                                @blur="saveRefs"
                                @keydown.enter.prevent="saveRefs"
                            >
                            <span v-else-if="note.refs.length" class="tm-memo__refs">
                                <template v-for="ref in note.refs" :key="ref">
                                    <NuxtLink v-if="taskOf(ref)" :to="localePath(`/app/tasks/${taskOf(ref)!.uuid}`)" class="tm-memo__ref is-task">{{ ref }}</NuxtLink>
                                    <NuxtLink
                                        v-else-if="recordOf(ref)"
                                        :to="localePath(`/app/tasks/notes/${recordOf(ref)!.uuid}`)"
                                        class="tm-memo__ref is-record" :class="`is-${recordOf(ref)!.kind}`" :title="recordOf(ref)!.title"
                                    >
                                        {{ ref }}
                                    </NuxtLink>
                                    <span v-else class="tm-memo__ref">{{ ref }}</span>
                                </template>
                            </span>
                            <span v-else class="tm-memo__none">—</span>
                        </dd>
                    </div>
                    <div v-if="tone" class="tm-memo__fact">
                        <dt>{{ t('cms.tasks.notes.meta.status') }}</dt>
                        <dd><NoteStamp :tone="tone" size="md" /></dd>
                    </div>
                </dl>

                <NuxtLink v-if="note.superseded_by" :to="localePath(`/app/tasks/notes/${note.superseded_by.uuid}`)" class="tm-memo__strip is-replaced">
                    {{ t('cms.tasks.notes.replacedBy', { key: note.superseded_by.key }) }}<Icon name="arrow-right" :size="14" />
                </NuxtLink>
                <NuxtLink v-if="note.supersedes" :to="localePath(`/app/tasks/notes/${note.supersedes.uuid}`)" class="tm-memo__strip">
                    {{ t('cms.tasks.notes.replaces', { key: note.supersedes.key }) }}<Icon name="arrow-right" :size="14" />
                </NuxtLink>
                <p v-if="note.archived_at" class="tm-memo__strip is-archived">{{ t('cms.tasks.notes.archivedBanner') }}</p>

                <section class="tm-memo__section">
                    <h2 class="tm-memo__label">{{ t(`cms.tasks.notes.fields.body.${note.kind}`) }}</h2>

                    <div v-if="editing" class="tm-memo__editing" @keydown.meta.enter.prevent="saveBody" @keydown.ctrl.enter.prevent="saveBody">
                        <RichEditor v-model="body" :placeholder="t('cms.tasks.notes.fields.bodyPlaceholder.note')" class="tm-memo__editor" />
                        <div class="tm-memo__edit-actions">
                            <Button size="sm" :loading="busy" @click="saveBody">{{ t('common.save') }}</Button>
                            <Button size="sm" variant="ghost" @click="editing = false">{{ t('common.cancel') }}</Button>
                        </div>
                    </div>
                    <div
                        v-else
                        class="tm-memo__body" :class="{ 'is-editable': editable }"
                        :role="editable ? 'button' : undefined" :tabindex="editable ? 0 : undefined"
                        :aria-label="editable ? t('cms.tasks.notes.editBody') : undefined"
                        @click="startEditing" @keydown.enter.prevent="startEditing"
                    >
                        <RichText v-if="note.body" :body="note.body" />
                        <p v-else class="tm-memo__none">{{ editable ? t('cms.tasks.notes.addBody') : '—' }}</p>
                    </div>
                </section>

                <section v-if="note.kind === 'decision' && note.rationale" class="tm-memo__section">
                    <h2 class="tm-memo__label">{{ t('cms.tasks.notes.fields.rationale') }}</h2>
                    <RichText :body="note.rationale" class="tm-memo__body" />
                </section>

                <section v-if="note.tasks.length" class="tm-memo__section">
                    <h2 class="tm-memo__label">{{ t('cms.tasks.notes.linkedTasks') }}</h2>
                    <ul class="tm-memo__tasks">
                        <li v-for="task in note.tasks" :key="task.uuid">
                            <NuxtLink :to="localePath(`/app/tasks/${task.uuid}`)" class="tm-memo__task">
                                <span class="tm-memo__task-key">{{ task.key }}</span>
                                <span class="tm-memo__task-title">{{ task.title }}</span>
                                <StatusLozenge :status="task.status" />
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <section v-if="note.kind === 'directive'" class="tm-memo__section">
                    <div class="tm-memo__sheet-head">
                        <h2 class="tm-memo__label">{{ t('cms.tasks.notes.sheet') }}</h2>
                        <span class="tm-memo__sheet-count">{{ t('cms.tasks.notes.sheetProgress', { done: done, total: note.audience.length }) }}</span>
                    </div>
                    <div class="tm-memo__progress"><span :style="{ width: `${share}%` }" /></div>

                    <ol class="tm-memo__sheet">
                        <li v-for="(row, index) in note.audience" :key="row.person.uuid" class="tm-memo__sheet-row" :class="{ 'is-done': row.acknowledged_at, 'is-me': row.person.uuid === me }">
                            <span class="tm-memo__sheet-no">{{ String(index + 1).padStart(2, '0') }}</span>
                            <span class="tm-memo__person"><TaskAvatar :person="row.person" size="sm" />{{ row.person.name }}</span>
                            <span v-if="row.acknowledged_at" class="tm-memo__sheet-mark"><Icon name="check" :size="14" :stroke="2.6" />{{ stamp(row.acknowledged_at) }}</span>
                            <span v-else class="tm-memo__sheet-wait">{{ t('cms.tasks.notes.waiting') }}</span>
                        </li>
                    </ol>

                    <form v-if="note.acks?.mine === 'pending' && live" class="tm-memo__confirm" @submit.prevent="confirm">
                        <Checkbox v-model="agreed" :label="t('cms.tasks.notes.confirmLabel')" />
                        <Button type="submit" :disabled="!agreed || busy" :loading="busy">{{ t('cms.tasks.notes.confirm') }}</Button>
                    </form>
                    <p v-else-if="myAck" class="tm-memo__confirmed"><Icon name="check" :size="15" :stroke="2.6" />{{ t('cms.tasks.notes.confirmedAt', { date: stamp(myAck) }) }}</p>
                </section>

                <footer class="tm-memo__foot">
                    <template v-if="note.kind !== 'note'">
                        <Icon name="shield" :size="15" />{{ t('cms.tasks.notes.immutable') }}
                    </template>
                    <template v-else>{{ t('cms.tasks.notes.editedAt', { date: stamp(note.updated_at) }) }}</template>
                </footer>
            </article>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import MoreMenu from '~/shared/components/moreMenu/MoreMenu.vue'
import RichEditor from '~/shared/components/richEditor/RichEditor.vue'
import RichText from '~/shared/components/richText/RichText.vue'
import Checkbox from '~/shared/components/checkbox/Checkbox.vue'
import TaskAvatar from '~/modules/tasks/components/taskAvatar/TaskAvatar.vue'
import NoteStamp from '~/modules/tasks/components/noteStamp/NoteStamp.vue'
import StatusLozenge from '~/modules/tasks/components/statusLozenge/StatusLozenge.vue'
import { noteTone, refsOf } from '~/modules/tasks/helpers'
import { useNoteComposer } from '~/modules/tasks/hooks/use-note-composer'
import { useNote } from './Note.hooks'

const AUDIENCE_NAMES = 3

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { start } = useNoteComposer()

const { note, status, busy, save, confirm: acknowledge, toggleArchive, elevated, me } = useNote()

const title = ref('')
const refs = ref('')
const body = ref('')
const editing = ref(false)
const agreed = ref(false)

watch(note, (value) => {
    title.value = value?.title ?? ''
    refs.value = (value?.refs ?? []).join(', ')
}, { immediate: true })

const live = computed(() => Boolean(note.value && !note.value.archived_at && !note.value.superseded_by))

const editable = computed(() => Boolean(note.value && note.value.kind === 'note' && !note.value.archived_at
    && (note.value.author?.uuid === me.value || elevated.value)))

const canArchive = computed(() => Boolean(note.value && (note.value.author?.uuid === me.value || elevated.value)))

const tone = computed(() => (note.value ? noteTone(note.value) : null))

const done = computed(() => (note.value?.audience ?? []).filter(row => row.acknowledged_at).length)

const share = computed(() => (note.value?.audience.length ? Math.round((done.value / note.value.audience.length) * 100) : 0))

const myAck = computed(() => note.value?.audience.find(row => row.person.uuid === me.value)?.acknowledged_at ?? null)

const audienceLine = computed(() => {
    const names = (note.value?.audience ?? []).map(row => row.person.name)

    if (names.length <= AUDIENCE_NAMES) return names.join(', ') || '—'

    return t('cms.tasks.notes.meta.audience', { names: names.slice(0, AUDIENCE_NAMES).join(', '), n: names.length - AUDIENCE_NAMES })
})

const moreItems = computed(() => [
    note.value?.archived_at
        ? { key: 'restore', label: t('cms.tasks.restore'), icon: 'undo' }
        : { key: 'archive', label: t('cms.tasks.archive'), icon: 'folder' },
])

const taskOf = (ref: string) => note.value?.tasks.find(task => task.key === ref) ?? null

const recordOf = (ref: string) => {
    const match = /^(NOTE|DEC|DIR)-0*(\d+)$/.exec(ref)

    return match ? note.value?.notes.find(item => item.key === `${match[1]}-${match[2]!.padStart(3, '0')}`) ?? null : null
}

const stamp = (iso: string) => new Intl.DateTimeFormat(locale.value, {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
}).format(new Date(iso))

const startEditing = () => {
    if (!editable.value || !note.value) return

    body.value = note.value.body
    editing.value = true
}

const saveTitle = () => {
    const next = title.value.trim()

    if (!note.value || !next || next === note.value.title) {
        title.value = note.value?.title ?? ''

        return
    }

    void save({ title: next })
}

const saveRefs = () => {
    const next = refsOf(refs.value)

    if (note.value && next.join(',') !== note.value.refs.join(',')) void save({ refs: next })
}

async function saveBody() {
    if (note.value && body.value !== note.value.body) await save({ body: body.value })

    editing.value = false
}

async function confirm() {
    if (agreed.value && await acknowledge()) agreed.value = false
}

useSeoMeta({ title: () => (note.value ? `${note.value.key} ${note.value.title}` : t('cms.tasks.notes.title')), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_note.scss';
</style>
