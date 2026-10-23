<template>
    <span
        class="tm-task-avatar"
        :class="[`is-${size ?? 'md'}`, { 'is-empty': !person }]"
        :title="person?.name ?? t('cms.tasks.unassigned')"
        aria-hidden="true"
    >
        <template v-if="person">{{ initialsOf(person.name) }}</template>
        <Icon v-else name="user" :size="size === 'lg' ? 16 : 12" :stroke="2" />
    </span>
</template>

<script setup lang="ts">
import { initialsOf } from '~/modules/tasks/helpers'
import type { ITaskAvatarProps } from './TaskAvatar.d'

defineProps<ITaskAvatarProps>()

const { t } = useI18n()
</script>

<style lang="scss">
@use '../../../../shared/styles/utils' as *;

.tm-task-avatar {
    display: inline-grid;
    flex: none;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #E4E7EC;
    color: #0B192C;
    font-size: size(11);
    font-weight: 700;
    letter-spacing: .02em;
    line-height: 1;

    &.is-sm { width: 24px; height: 24px; font-size: size(11); }

    &.is-lg { width: 32px; height: 32px; font-size: size(12); }

    &.is-empty {
        border: 1px dashed #B8BFCB;
        background: transparent;
        color: #8590A2;
    }
}
</style>
