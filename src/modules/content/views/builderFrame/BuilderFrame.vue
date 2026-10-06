<template>
    <div
        ref="root"
        class="tm-frame"
        :class="[`is-${page}`, { 'is-clean': clean, 'is-dragging': indicator !== null }]"
        :style="{ '--tm-frame-zoom': zoom }"
        @click.capture="guard"
        @click="select(null)"
        @dragover.prevent="overEnd"
        @dragleave="leave"
        @drop.prevent="drop"
    >
        <div
            v-for="(block, index) in blocks" :key="block.key"
            :data-block="block.key"
            class="tm-frame__block"
            :class="{
                'is-selected': selected === block.key,
                'is-hidden': block.hidden,
                'is-broken': block.problem,
                'is-moving': dragging === block.key,
            }"
            :draggable="grabbed === block.key"
            @click.stop="select(block.key)"
            @dragstart="startDrag(block.key, $event)"
            @dragover.prevent.stop="overBlock($event, index)"
            @drop.prevent.stop="drop"
            @dragend="endDrag"
        >
            <span v-if="indicator === index" class="tm-frame__line" aria-hidden="true" />

            <div v-if="!clean" class="tm-frame__chrome" @click.stop>
                <span class="tm-frame__tag" @click="select(block.key)">
                    <Icon :name="BLOCKS[block.kind].icon" :size="14" :stroke="2" />
                    {{ t(`cms.blocks.kinds.${block.kind}`) }}
                    <em v-if="block.hidden">· {{ t('cms.sections.hidden') }}</em>
                </span>

                <div class="tm-frame__tools">
                    <span
                        class="tm-frame__tool is-grip" :title="t('cms.sections.drag')"
                        @pointerdown="grabbed = block.key"
                        @pointerup="grabbed = null"
                    >
                        <Icon name="grip" :size="16" :stroke="2.4" />
                    </span>
                    <button
                        v-for="tool in TOOLS.filter(item => item.action !== 'duplicate' || !SINGLE_KINDS.includes(block.kind))" :key="tool.action"
                        type="button" class="tm-frame__tool"
                        :class="{ 'is-danger': tool.action === 'remove' }"
                        :disabled="(tool.action === 'up' && index === 0) || (tool.action === 'down' && index === blocks.length - 1)"
                        :title="t(tool.action === 'toggle' && block.hidden ? 'cms.builder.actions.show' : `cms.builder.actions.${tool.action}`)"
                        :aria-label="t(tool.action === 'toggle' && block.hidden ? 'cms.builder.actions.show' : `cms.builder.actions.${tool.action}`)"
                        @click="act(block.key, tool.action)"
                    >
                        <Icon :name="tool.action === 'toggle' && block.hidden ? 'eye' : tool.icon" :size="16" :stroke="2" />
                    </button>
                </div>
            </div>

            <ContentSection v-if="block.section" :section="block.section" eager />

            <div v-else class="tm-frame__empty">
                <Icon :name="BLOCKS[block.kind].icon" :size="22" />
                <strong>{{ t(`cms.blocks.kinds.${block.kind}`) }}</strong>
                <span>{{ block.problem ?? t('cms.builder.emptyBlock') }}</span>
            </div>
        </div>

        <span v-if="indicator === blocks.length && blocks.length" class="tm-frame__line is-end" aria-hidden="true" />

        <div v-if="!clean" class="tm-frame__drop" :class="{ 'is-first': !blocks.length, 'is-target': indicator === blocks.length }">
            <Icon name="plus" :size="20" />
            <span>{{ blocks.length ? t('cms.builder.dropHere') : t('cms.builder.emptyPage') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { BLOCKS, SINGLE_KINDS } from '~/modules/content/contracts/blocks'
import type { BlockAction } from '~/modules/content/contracts/builder'
import { useBuilderFrame } from './BuilderFrame.hooks'

const { t } = useI18n()

const root = useTemplateRef<HTMLElement>('root')

const TOOLS: Array<{ action: BlockAction, icon: string }> = [
  { action: 'up', icon: 'chevron-up' },
  { action: 'down', icon: 'chevron' },
  { action: 'duplicate', icon: 'copy' },
  { action: 'toggle', icon: 'eye-off' },
  { action: 'remove', icon: 'trash' },
]

const {
  page, blocks, selected, clean, zoom,
  select, act, guard,
  grabbed, dragging, indicator, startDrag, overBlock, overEnd, leave, drop, endDrag,
} = useBuilderFrame(root)

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_builder-frame.scss';
</style>
