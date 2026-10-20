<template>
    <canvas ref="canvas" class="tm-banner-canvas" />
</template>

<script setup lang="ts">
import { renderBanner } from '../../helpers/banner/render'
import type { IBannerSpec } from '../../helpers/banner/render'

const props = defineProps<{ spec: IBannerSpec | null }>()

const canvas = ref<HTMLCanvasElement | null>(null)

let frame = 0

const draw = () => {
    cancelAnimationFrame(frame)

    frame = requestAnimationFrame(() => {
        if (canvas.value && props.spec) renderBanner(canvas.value, props.spec)
    })
}

watch(() => props.spec, draw)

onMounted(draw)

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<style lang="scss">
.tm-banner-canvas {
    display: block;
    width: 100%;
    height: auto;
}
</style>
