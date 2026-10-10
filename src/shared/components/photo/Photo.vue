<template>
    <div
        class="tm-photo"
        :class="[
            showImage ? null : photo.tint ? ['ph', `ph--${photo.tint}`] : 'tm-photo--empty',
            { 'tm-photo--fill': ratio === 'fill', 'is-loaded': loaded || eager },
        ]"
        :style="{ aspectRatio: ratio === 'auto' || ratio === 'fill' ? undefined : ratio }"
    >
        <img
            v-if="showImage"
            ref="image"
            :src="photo.src ?? undefined"
            :alt="photo.alt"
            :loading="eager ? 'eager' : 'lazy'"
            :fetchpriority="eager ? 'high' : undefined"
            decoding="async"
            :sizes="sizes"
            @load="loaded = true"
            @error="failed = true"
        >
        <Icon v-if="!showImage && !photo.tint" name="image" :size="34" class="tm-photo__empty-icon" />

        <slot />
    </div>
</template>

<script setup lang="ts">
import type { IPhotoProps } from './Photo.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const props = withDefaults(defineProps<IPhotoProps>(), { ratio: '4 / 3' })

const image = useTemplateRef<HTMLImageElement>('image')

const loaded = ref(false)
const failed = ref(false)

const showImage = computed(() => Boolean(props.photo.src) && !failed.value)

function settle() {
    const element = image.value

    if (!element?.complete) return

    if (element.naturalWidth > 0) loaded.value = true
    else failed.value = true
}

watch(() => props.photo.src, async () => {
    loaded.value = false
    failed.value = false

    await nextTick()
    settle()
})

onMounted(settle)
</script>

<style lang="scss">
@use './_photo.scss';
</style>
