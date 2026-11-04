<template>
    <Tooltip :text="person?.name ?? t('cms.tasks.unassigned')">
        <span
            class="tm-task-avatar"
            :class="[`is-${size ?? 'md'}`, person ? `is-tone-${avatarTone(person.uuid)}` : 'is-empty']"
            aria-hidden="true"
        >
            <template v-if="person">{{ initialsOf(person.name) }}</template>
            <Icon v-else name="user" :size="size === 'lg' ? 16 : 12" :stroke="2" />
        </span>
    </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
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
    background: #0A0A0A;
    color: #FFFFFF;
    font-size: size(11);
    font-weight: 700;
    letter-spacing: .02em;
    line-height: 1;

    &.is-sm { width: 24px; height: 24px; font-size: size(11); }

    &.is-lg { width: 32px; height: 32px; font-size: size(12); }

    &.is-empty {
        border: 1.5px dashed rgba(10, 10, 10, .3);
        background: #FFFFFF;
        color: rgba(10, 10, 10, .45);
    }

    &.is-tone-1 { background: #262626; }
    &.is-tone-2 { background: #8F3C00; }
    &.is-tone-3 { background: #2E7D4F; }
    &.is-tone-4 { background: #B84D00; }
    &.is-tone-5 { background: #525252; }
    &.is-tone-6 { background: #9B3D5A; }
    &.is-tone-7 { background: #404040; }
}
</style>
