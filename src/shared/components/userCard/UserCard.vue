<template>
    <div class="tm-user-card" :class="{ 'is-compact': compact }">
        <Tooltip :text="name" side="right" :disabled="!compact || !name" class="tm-user-card__link-tip">
            <component :is="to ? NuxtLink : 'span'" v-bind="to ? { to } : {}" class="tm-user-card__link" :aria-label="compact ? name : undefined">
                <span class="tm-user-card__avatar" aria-hidden="true">
                    <img v-if="avatar" :src="avatar" :alt="''" width="24" height="24">
                    <span v-else class="tm-user-card__initials">{{ initials }}</span>
                </span>

                <span v-if="!compact" class="tm-user-card__identity">
                    <span class="tm-user-card__name">{{ name }}</span>
                    <span v-if="role" class="tm-user-card__role">{{ role }}</span>
                </span>
            </component>
        </Tooltip>

        <Tooltip :text="actionLabel ?? ''" :side="compact ? 'right' : 'top'" :disabled="!actionLabel">
            <button
                type="button" class="tm-user-card__action"
                :aria-label="actionLabel"
                @click="$emit('action')"
            >
                <Icon :name="actionIcon ?? 'logout'" :size="16" />
            </button>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
import type { IUserCardProps } from './UserCard.d'

const props = defineProps<IUserCardProps>()

defineEmits<{ action: [] }>()

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join(''))
</script>

<style lang="scss">
@use './_user-card.scss';
</style>
