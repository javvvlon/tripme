<template>
    <div class="tm-user-card" :class="{ 'is-compact': compact }">
        <span class="tm-user-card__avatar" aria-hidden="true">
            <img v-if="avatar" :src="avatar" :alt="''" width="44" height="44">
            <span v-else class="tm-user-card__initials">{{ initials }}</span>
        </span>

        <span v-if="!compact" class="tm-user-card__identity">
            <span class="tm-user-card__name" :title="name">{{ name }}</span>
            <span v-if="role" class="tm-user-card__role">{{ role }}</span>
        </span>

        <button
            type="button" class="tm-user-card__action"
            :aria-label="actionLabel" :title="actionLabel"
            @click="$emit('action')"
        >
            <Icon :name="actionIcon ?? 'logout'" :size="20" />
        </button>
    </div>
</template>

<script setup lang="ts">
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
