<template>
    <SideDrawer v-model="open" :title="t('cms.tasks.composer.title')" :subtitle="t('cms.tasks.composer.subtitle')" size="lg">
        <form :id="formId" class="tm-task-composer" @submit.prevent="submit" @keydown.meta.enter.prevent="submit" @keydown.ctrl.enter.prevent="submit">
            <Input
                v-model="draft.title"
                :label="t('cms.tasks.fields.title')"
                :placeholder="t('cms.tasks.fields.titlePlaceholder')"
                required
                class="tm-task-composer__title"
            />

            <div class="tm-task-composer__field">
                <span class="tm-task-composer__label">{{ t('cms.tasks.fields.description') }}</span>
                <RichEditor v-model="draft.description" :placeholder="t('cms.tasks.fields.descriptionPlaceholder')" class="tm-task-composer__editor" />
            </div>

            <div class="tm-task-composer__grid">
                <SelectMenu v-model="draft.status" :options="statusOptions" :label="t('cms.tasks.fields.status')" size="md" />
                <SelectMenu v-model="draft.priority" :options="priorityOptions" :label="t('cms.tasks.fields.priority')" size="md" />

                <Combobox
                    v-if="elevated"
                    :model-value="draft.assigneeId ?? ''"
                    variant="field"
                    :label="t('cms.tasks.fields.assignee')"
                    :options="assignOptions"
                    :placeholder="t('cms.tasks.unassigned')"
                    clearable
                    menu-align="start"
                    @update:model-value="draft.assigneeId = $event || null"
                />
                <div v-else class="tm-task-composer__field">
                    <span class="tm-task-composer__label">{{ t('cms.tasks.fields.assignee') }}</span>
                    <span class="tm-task-composer__me">{{ t('cms.tasks.composer.you') }}</span>
                </div>

                <Input v-model="draft.dueOn" type="date" :label="t('cms.tasks.fields.due')" />

                <Input v-model="draft.labels" :label="t('cms.tasks.fields.labels')" :placeholder="t('cms.tasks.fields.labelsHint')" class="tm-task-composer__wide" />
            </div>
        </form>

        <template #footer>
            <Checkbox v-model="another" :label="t('cms.tasks.composer.another')" class="tm-task-composer__another" />
            <Button type="button" variant="ghost" @click="open = false">{{ t('common.cancel') }}</Button>
            <Button type="submit" :form="formId" :loading="busy" :disabled="!draft.title.trim() || busy">{{ t('cms.tasks.create') }}</Button>
        </template>
    </SideDrawer>
</template>

<script setup lang="ts">
import SideDrawer from '~/shared/components/sideDrawer/SideDrawer.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import RichEditor from '~/shared/components/richEditor/RichEditor.vue'
import Checkbox from '~/shared/components/checkbox/Checkbox.vue'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import { useTasksRepository } from '~/modules/tasks/repositories'
import { useTaskComposer } from '~/modules/tasks/hooks/use-task-composer'
import { TASK_PRIORITIES, TASK_STATUSES } from '~/modules/tasks/contracts/tasks'
import type { ITaskDraft } from '~/modules/tasks/contracts/tasks'

const { t } = useI18n()
const { failed, saved } = useToast()
const { create } = useTasksRepository()
const { elevated, me, assignOptions } = useManagers()
const { open, preset, last } = useTaskComposer()

const formId = useId()

const blank = (): ITaskDraft => ({
    title: '',
    description: '',
    status: preset.value ?? 'todo',
    priority: 'medium',
    assigneeId: me.value || null,
    dueOn: '',
    labels: '',
})

const draft = reactive<ITaskDraft>(blank())
const another = ref(false)
const busy = ref(false)

const focusTitle = () => {
    setTimeout(() => document.querySelector<HTMLInputElement>('.tm-task-composer__title input')?.focus(), 80)
}

watch(open, (value) => {
    if (!value) return

    Object.assign(draft, blank())
    focusTitle()
})

const statusOptions = computed(() => TASK_STATUSES.map(value => ({ value, label: t(`cms.tasks.status.${value}`) })))

const priorityOptions = computed(() => TASK_PRIORITIES.map(value => ({ value, label: t(`cms.tasks.priority.${value}`) })))

async function submit() {
    if (!draft.title.trim() || busy.value) return

    busy.value = true

    try {
        const task = await create({ ...draft, assigneeId: elevated.value ? draft.assigneeId : me.value })

        last.value = task
        saved(t('cms.tasks.createdKey', { key: task.key }))
        await refreshNuxtData(['cms:tasks', 'tasks:summary'])

        if (another.value) {
            Object.assign(draft, { ...blank(), status: draft.status, assigneeId: draft.assigneeId })
            focusTitle()
        }
        else {
            open.value = false
        }
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

.tm-task-composer {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 20px 22px 28px;
    overflow-y: auto;

    &__field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
    }

    &__label {
        color: var(--tm-ink-3);
        font-size: size(13);
        font-weight: 600;
    }

    &__editor {
        background: #FFFFFF;

        .tm-rte__bar { background: #F7F8F9; }

        .tm-rte__content .ProseMirror {
            min-height: 220px;
            padding: 14px 16px 20px;
            font-size: size(15);
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
        gap: 16px;

        .tm-select { display: flex; }
    }

    &__wide { grid-column: 1 / -1; }

    &__me {
        display: flex;
        align-items: center;
        min-height: 40px;
        color: var(--tm-ink-2);
        font-size: size(14);
    }

    &__another { margin-right: auto; }

    @media #{$until-md} {
        padding: 16px;

        &__grid { grid-template-columns: minmax(0, 1fr); }
    }
}
</style>
