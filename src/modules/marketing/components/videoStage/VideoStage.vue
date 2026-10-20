<template>
    <div class="tm-video-stage" :class="{ 'is-playing': playing }">
        <canvas ref="canvas" class="tm-video-stage__canvas" @click="toggle" />

        <button v-if="!playing" type="button" class="tm-video-stage__big" :aria-label="t('cms.marketing.video.play')" @click="toggle">
            <Icon name="play-solid" :size="26" />
        </button>

        <div class="tm-video-stage__bar">
            <button type="button" class="tm-video-stage__control" :aria-label="playing ? t('cms.marketing.video.pause') : t('cms.marketing.video.play')" @click="toggle">
                <Icon :name="playing ? 'pause' : 'play-solid'" :size="16" />
            </button>
            <input
                class="tm-video-stage__scrub"
                type="range"
                min="0"
                :max="duration"
                step="0.01"
                :value="time"
                :aria-label="t('cms.marketing.video.position')"
                :style="{ '--done': progress }"
                @input="seek(Number(($event.target as HTMLInputElement).value))"
            >
            <span class="tm-video-stage__time">{{ clock }}</span>
            <button type="button" class="tm-video-stage__control" :aria-label="muted ? t('cms.marketing.video.soundOn') : t('cms.marketing.video.soundOff')" @click="toggleMute">
                <Icon :name="muted ? 'volume-off' : 'volume'" :size="16" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useVideoStage } from './VideoStage.hooks'
import type { IVideoStageProps } from './VideoStage.hooks'

const props = defineProps<IVideoStageProps>()

const { t } = useI18n()

const { canvas, playing, muted, time, clock, progress, duration, toggle, pause, seek, toggleMute } = useVideoStage(props)

defineExpose({ pause })
</script>

<style lang="scss">
@use './_video-stage.scss';
</style>
