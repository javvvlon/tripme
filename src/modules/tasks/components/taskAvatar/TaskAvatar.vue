<template>
    <span
        class="tm-task-avatar"
        :class="[`is-${size ?? 'md'}`, person ? `is-tone-${avatarTone(person.uuid)}` : 'is-empty']"
        :title="person?.name ?? t('cms.tasks.unassigned')"
        aria-hidden="true"
    >
        <template v-if="person">{{ initialsOf(person.name) }}</template>
        <Icon v-else name="user" :size="size === 'lg' ? 16 : 12" :stroke="2" />
    </span>
</template>

<script setup lang="ts">
import { avatarTone, initialsOf } from '~/modules/tasks/helpers'
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
    background: #0B192C;
    color: #FFFFFF;
    font-size: size(11);
    font-weight: 700;
    letter-spacing: .02em;
    line-height: 1;

    &.is-sm { width: 24px; height: 24px; font-size: size(11); }

    &.is-lg { width: 32px; height: 32px; font-size: size(12); }

    &.is-empty {
        border: 1.5px dashed rgba(11, 25, 44, .3);
        background: #FFFFFF;
        color: rgba(11, 25, 44, .45);
    }

    &.is-tone-1 { background: #1F6F78; }
    &.is-tone-2 { background: #6B4E9B; }
    &.is-tone-3 { background: #2E7D4F; }
    &.is-tone-4 { background: #8A6D1F; }
    &.is-tone-5 { background: #3D5A80; }
    &.is-tone-6 { background: #9B3D5A; }
    &.is-tone-7 { background: #4A5568; }
}
</style>
