<template>
    <div
        class="tm-photo"
        :class="photo.src ? null : photo.tint ? ['ph', `ph--${photo.tint}`] : 'tm-photo--empty'"
        :style="{ aspectRatio: ratio === 'auto' ? undefined : ratio }"
    >
        <img
            v-if="photo.src"
            :src="photo.src"
            :alt="photo.alt"
            :loading="eager ? 'eager' : 'lazy'"
            :fetchpriority="eager ? 'high' : undefined"
            decoding="async"
            :sizes="sizes"
        >
        <Icon v-if="!photo.src && !photo.tint" name="image" :size="34" class="tm-photo__empty-icon" />

        <slot />
    </div>
</template>

<script setup lang="ts">
import type { IPhotoProps } from './Photo.d'

withDefaults(defineProps<IPhotoProps>(), { ratio: '4 / 3' })
</script>

<style lang="scss">
@use './_photo.scss';
</style>
