<template>
    <SideDrawer v-model="open" :title="t('cms.tasks.notes.composer.title')" :subtitle="t('cms.tasks.notes.composer.subtitle')" size="lg">
        <form :id="formId" class="tm-note-composer" @submit.prevent="submit" @keydown.meta.enter.prevent="submit" @keydown.ctrl.enter.prevent="submit">
            <fieldset class="tm-note-composer__kinds">
                <legend class="tm-note-composer__label">{{ t('cms.tasks.notes.composer.kind') }}</legend>
                <label
                    v-for="item in NOTE_KINDS" :key="item"
                    class="tm-note-composer__kind" :class="[`is-${item}`, { 'is-on': draft.kind === item, 'is-locked': !allowed(item) || (replacing && replacing.kind !== item) }]"
                >
                    <input
                        v-model="draft.kind" type="radio" name="note-kind" :value="item" class="sr-only"
                        :disabled="!allowed(item) || Boolean(replacing && replacing.kind !== item)"
                    >
                    <span class="tm-note-composer__kind-name">{{ t(`cms.tasks.notes.kinds.${item}`) }}</span>
                    <span class="tm-note-composer__kind-hint">{{ allowed(item) ? t(`cms.tasks.notes.kindHints.${item}`) : t('cms.tasks.notes.onlyManagers') }}</span>
                </label>
            </fieldset>

            <p v-if="replacing" class="tm-note-composer__replacing">
                <strong>{{ t('cms.tasks.notes.replaces', { key: replacing.key }) }}</strong>
                {{ t('cms.tasks.notes.composer.replacingHint', { key: replacing.key }) }}
            </p>

            <Input
                v-model="draft.title"
                :label="t('cms.tasks.notes.fields.title')"
                :placeholder="t('cms.tasks.notes.fields.titlePlaceholder')"
                required
                class="tm-note-composer__title"
            />

            <div class="tm-note-composer__field">
                <span class="tm-note-composer__label">{{ t(`cms.tasks.notes.fields.body.${draft.kind}`) }}</span>
                <RichEditor v-model="draft.body" :placeholder="t(`cms.tasks.notes.fields.bodyPlaceholder.${draft.kind}`)" class="tm-note-composer__editor" />
            </div>

            <div v-if="draft.kind === 'decision'" class="tm-note-composer__field">
                <span class="tm-note-composer__label">{{ t('cms.tasks.notes.fields.rationale') }}</span>
                <RichEditor v-model="draft.rationale" compact :placeholder="t('cms.tasks.notes.fields.rationalePlaceholder')" class="tm-note-composer__editor is-short" />
            </div>

            <div v-if="draft.kind === 'directive'" class="tm-note-composer__field">
                <span class="tm-note-composer__label">{{ t('cms.tasks.notes.fields.audience') }}</span>
                <Checkbox v-model="draft.everyone" :label="t('cms.tasks.notes.fields.everyone', { n: teamSize })" />
                <MultiSelect
                    v-if="!draft.everyone"
                    v-model="draft.audience"
                    :label="t('cms.tasks.notes.fields.people')"
                    :options="peopleOptions"
                    :placeholder="t('cms.tasks.notes.fields.peoplePlaceholder')"
                />
            </div>

            <Input
                v-model="draft.refs"
                :label="t('cms.tasks.notes.fields.refs')"
                :placeholder="t('cms.tasks.notes.fields.refsHint')"
            />
        </form>

        <template #footer>
            <p v-if="draft.kind !== 'note'" class="tm-note-composer__notice">
                <Icon name="shield" :size="15" />{{ t('cms.tasks.notes.composer.locked') }}
            </p>
            <Button type="button" variant="ghost" @click="open = false">{{ t('common.cancel') }}</Button>
            <Button type="submit" :form="formId" :loading="busy" :disabled="!ready || busy">
                {{ draft.kind === 'note' ? t('common.save') : t('cms.tasks.notes.publish') }}
            </Button>
        </template>
    </SideDrawer>
</template>

<script setup lang="ts">
import SideDrawer from '~/shared/components/sideDrawer/SideDrawer.vue'
import RichEditor from '~/shared/components/richEditor/RichEditor.vue'
import Checkbox from '~/shared/components/checkbox/Checkbox.vue'
import MultiSelect from '~/shared/components/multiSelect/MultiSelect.vue'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { useNotesRepository } from '~/modules/tasks/repositories'
import { useNoteComposer } from '~/modules/tasks/hooks/use-note-composer'
import { NOTE_KINDS } from '~/modules/tasks/contracts/notes'
import type { INoteDraft, NoteKind } from '~/modules/tasks/contracts/notes'

const { t } = useI18n()
const localePath = useLocalePath()
const { failed, saved } = useToast()
const { create } = useNotesRepository()
const { elevated, me, people } = useManagers()
const { open, kind, replacing: previous } = useNoteComposer()

const formId = useId()

const blank = (): INoteDraft => ({
    kind: kind.value,
    title: '',
    body: '',
    rationale: '',
    refs: '',
    everyone: true,
    audience: [],
    supersedesId: previous.value?.uuid ?? null,
})

const draft = reactive<INoteDraft>(blank())
const busy = ref(false)

const replacing = computed(() => (previous.value ? { ...previous.value, kind: kind.value } : null))

const allowed = (item: NoteKind) => item === 'note' || elevated.value

const peopleOptions = computed(() => (people.value ?? [])
    .filter(person => person.uuid !== me.value)
    .map(person => ({ value: person.uuid, label: person.name, hint: t(`cms.ownership.roles.${person.role}`) })))

const teamSize = computed(() => peopleOptions.value.length)

const ready = computed(() => Boolean(draft.title.trim())
    && (draft.kind === 'note' || Boolean(draft.body.trim()))
    && (draft.kind !== 'directive' || draft.everyone || draft.audience.length > 0))

watch(open, (value) => {
    if (!value) return

    Object.assign(draft, blank())
    setTimeout(() => document.querySelector<HTMLInputElement>('.tm-note-composer__title input')?.focus(), 80)
})

async function submit() {
    if (!ready.value || busy.value) return

    busy.value = true

    try {
        const note = await create({ ...draft })

        saved(t(note.kind === 'note' ? 'cms.tasks.notes.saved' : 'cms.tasks.notes.created', { key: note.key }))
        open.value = false
        await refreshNuxtData(['notes:list', 'notes:pending'])
        await navigateTo(localePath(`/app/tasks/notes/${note.uuid}`))
    }
    catch (e) {
        failed(e)
    }
    finally {
        busy.value = false
    }
}
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-note-composer {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 20px 22px 28px;
    overflow-y: auto;

    &__label {
        padding: 0;
        color: var(--tm-ink-3);
        font-size: size(13);
        font-weight: 600;
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
    }

    &__kinds {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin: 0;
        padding: 0;
        border: 0;

        legend { margin-bottom: 8px; }
    }

    &__kind {
        --tm-kind: #5B6B82;

        position: relative;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 14px 14px 12px;
        border: 1px solid rgba(11, 25, 44, .16);
        border-radius: 6px;
        background: #FFFFFF;
        cursor: pointer;
        transition: border-color .15s ease, box-shadow .15s ease;

        &::before {
            content: '';
            position: absolute;
            top: -1px;
            right: -1px;
            left: -1px;
            height: 3px;
            border-radius: 6px 6px 0 0;
            background: var(--tm-kind);
            opacity: .35;
        }

        &.is-decision { --tm-kind: #0B192C; }
        &.is-directive { --tm-kind: #9A7414; }

        &:hover:not(.is-locked) { border-color: rgba(11, 25, 44, .35); }

        &.is-on {
            border-color: var(--tm-kind);
            box-shadow: 0 0 0 1px var(--tm-kind);

            &::before { opacity: 1; }
        }

        &.is-locked {
            cursor: not-allowed;
            opacity: .5;
        }

        &:focus-within { outline: 2px solid #0B192C; outline-offset: 2px; }
    }

    &__kind-name {
        color: var(--tm-ink-1);
        font-family: var(--tm-font-display-primary);
        font-size: size(14);
        font-weight: 700;
    }

    &__kind-hint {
        color: #626F86;
        font-size: size(12);
        line-height: 1.4;
    }

    &__replacing {
        margin: 0;
        padding: 10px 14px;
        border-left: 3px solid #9A7414;
        background: #FBF6E9;
        color: #533F04;
        font-size: size(13);
        line-height: 1.5;

        strong { margin-right: 4px; }
    }

    &__editor {
        background: #FFFFFF;

        .tm-rte__bar { background: #F7F8F9; }

        .tm-rte__content .ProseMirror {
            min-height: 200px;
            padding: 14px 16px 20px;
            font-size: size(15);
        }

        &.is-short .tm-rte__content .ProseMirror { min-height: 110px; }
    }

    @media #{$until-md} {
        padding: 16px;

        &__kinds { grid-template-columns: minmax(0, 1fr); }
    }
}

.tm-side-drawer__foot .tm-note-composer__notice {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 auto 0 0;
    color: #626F86;
    font-size: size(12);
}
</style>
