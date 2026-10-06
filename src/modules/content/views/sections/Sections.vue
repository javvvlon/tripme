<template>
    <div class="tm-builder" :class="{ 'is-clean': clean }">
        <header class="tm-builder__top">
            <div class="tm-builder__title">
                <h1>{{ t(`cms.pages.${page}.title`) }}</h1>
                <span class="tm-builder__state" :class="{ 'is-dirty': dirty }">
                    {{ dirty ? t('cms.builder.unsaved') : t('cms.builder.saved') }}
                </span>
            </div>

            <div class="tm-builder__devices" role="radiogroup" :aria-label="t('cms.builder.device')">
                <button
                    v-for="(spec, kind) in DEVICES" :key="kind"
                    type="button" role="radio" class="tm-builder__device"
                    :class="{ 'is-active': device === kind }"
                    :aria-checked="device === kind"
                    :title="t(`cms.builder.devices.${kind}`)" :aria-label="t(`cms.builder.devices.${kind}`)"
                    @click="device = kind"
                >
                    <Icon :name="spec.icon" :size="18" />
                </button>
            </div>

            <div class="tm-builder__actions">
                <LangSwitch
                    v-model="locale"
                    :label="t('cms.sections.language')"
                    :missing="missingFor(current)"
                    :missing-hint="t('cms.sections.notFilled')"
                />

                <button
                    type="button" class="tm-builder__icon-button"
                    :class="{ 'is-active': clean }" :aria-pressed="clean"
                    :title="t('cms.builder.clean')" :aria-label="t('cms.builder.clean')"
                    @click="clean = !clean"
                >
                    <Icon :name="clean ? 'eye-off' : 'eye'" :size="18" />
                </button>

                <a
                    :href="livePath" target="_blank" rel="noopener" class="tm-builder__icon-button"
                    :title="t('cms.builder.openLive')" :aria-label="t('cms.builder.openLive')"
                >
                    <Icon name="arrow-right" :size="18" />
                </a>

                <Button v-if="dirty" type="button" variant="ghost" size="md" :disabled="saving" @click="reset">
                    {{ t('cms.sections.discard') }}
                </Button>
                <Button type="button" size="md" :disabled="!dirty || saving" @click="submit">
                    {{ saving ? t('cms.saving') : t('cms.save') }}
                </Button>
            </div>
        </header>

        <BuilderSplash
            v-if="splashing"
            :ready="status !== 'pending' && frameReady"
            :steps="splashSteps"
            @done="splashing = false"
        />

        <div v-if="status !== 'pending'" class="tm-builder__body">
            <aside v-show="!clean" class="tm-builder__left">
                <section class="tm-builder__group">
                    <h2 class="tm-builder__heading">{{ t('cms.builder.blocks') }}</h2>
                    <p class="tm-builder__help">{{ t('cms.builder.blocksHint') }}</p>
                    <BlockPalette :kinds="kinds" :label="t('cms.builder.blocks')" @add="addBlock" />
                </section>

                <section class="tm-builder__group">
                    <h2 class="tm-builder__heading">{{ t('cms.builder.outline') }}</h2>

                    <p v-if="!draft.length" class="tm-builder__help">{{ t('cms.sections.empty') }}</p>

                    <ol class="tm-builder__outline">
                        <li
                            v-for="section in draft" :key="section.key"
                            class="tm-builder__layer"
                            :class="{
                                'is-active': selected === section.key,
                                'is-hidden': !section.isPublished,
                                'is-dragging': dragging === section.key,
                            }"
                            :draggable="grabbed === section.key"
                            @dragstart="startDrag(section.key, $event)"
                            @dragenter.prevent="dragOver(section.key)"
                            @dragover.prevent
                            @dragend="endDrag"
                            @drop.prevent="endDrag"
                        >
                            <span
                                class="tm-builder__grip" :title="t('cms.sections.drag')" aria-hidden="true"
                                @pointerdown="grabbed = section.key"
                                @pointerup="grabbed = null"
                            >
                                <Icon name="grip" :size="15" :stroke="2.6" />
                            </span>
                            <button type="button" class="tm-builder__layer-name" @click="focusBlock(section.key)">
                                <Icon :name="BLOCKS[section.kind].icon" :size="16" />
                                <span>{{ headingOf(section) }}</span>
                            </button>
                            <span v-if="problems[section.key]" class="tm-builder__dot" :title="problems[section.key]" />
                            <Icon v-else-if="!section.isPublished" name="eye-off" :size="15" class="tm-builder__muted" />
                        </li>
                    </ol>
                </section>
            </aside>

            <BuilderCanvas
                ref="canvas"
                :page="page"
                :sections="draft"
                :context="context"
                :locale="locale"
                :selected="selected"
                :problems="problems"
                :device="device"
                :clean="clean"
                :label="t('cms.builder.canvas')"
                @select="select"
                @action="onAction"
                @move="moveTo"
                @insert="insertAt"
                @ready="frameReady = true"
            />

            <aside v-show="!clean" class="tm-builder__right">
                <template v-if="current">
                    <header class="tm-builder__inspector-head">
                        <span class="tm-builder__kind"><Icon :name="BLOCKS[current.kind].icon" :size="20" /></span>
                        <div>
                            <strong>{{ t(`cms.blocks.kinds.${current.kind}`) }}</strong>
                            <span>{{ t(`cms.blocks.kindHints.${current.kind}`) }}</span>
                        </div>
                        <button
                            type="button" class="tm-builder__icon-button is-small"
                            :title="t('cms.builder.close')" :aria-label="t('cms.builder.close')"
                            @click="select(null)"
                        >
                            <Icon name="close" :size="16" />
                        </button>
                    </header>

                    <p v-if="problems[current.key]" class="tm-builder__problem">{{ problems[current.key] }}</p>

                    <div class="tm-builder__fields">
                        <Input
                            v-if="BLOCKS[current.kind].eyebrow"
                            v-model="current.eyebrows[locale]"
                            :label="`${t('cms.sections.eyebrow')} · ${locale.toUpperCase()}`"
                            :placeholder="t('cms.sections.eyebrowPlaceholder')"
                        />

                        <Input
                            v-model="current.titles[locale]"
                            :label="`${fieldLabel(current, 'title')} · ${locale.toUpperCase()}`"
                            :placeholder="t(`cms.sections.headingPlaceholders.${current.kind}`)"
                        />

                        <Input
                            v-if="BLOCKS[current.kind].subtitle"
                            v-model="current.subtitles[locale]"
                            :label="`${fieldLabel(current, 'subtitle')} · ${locale.toUpperCase()}`"
                            :placeholder="t(BLOCKS[current.kind].labels.subtitle ? `cms.sections.placeholders.${BLOCKS[current.kind].labels.subtitle}` : 'cms.sections.subtitlePlaceholder')"
                            :rows="BLOCKS[current.kind].labels.subtitle ? undefined : 3"
                        />

                        <div v-if="BLOCKS[current.kind].body === 'rich'" class="tm-builder__field">
                            <span class="tm-builder__label">{{ fieldLabel(current, 'body') }} · {{ locale.toUpperCase() }}</span>
                            <RichEditor
                                :key="current.key"
                                v-model="current.bodies[locale]"
                                compact
                                :placeholder="t('cms.sections.bodyPlaceholder')"
                            />
                        </div>

                        <Input
                            v-else-if="BLOCKS[current.kind].body === 'plain'"
                            v-model="current.bodies[locale]"
                            :label="`${fieldLabel(current, 'body')} · ${locale.toUpperCase()}`"
                            :placeholder="t('cms.sections.placeholders.quote')"
                            :rows="4"
                        />

                        <div v-if="BLOCKS[current.kind].cta" class="tm-builder__group-box">
                            <Input
                                v-model="current.ctaLabels[locale]"
                                :label="`${t('cms.sections.ctaLabel')} · ${locale.toUpperCase()}`"
                                :placeholder="t('cms.sections.ctaLabelPlaceholder')"
                            />
                            <Input
                                v-model="current.link"
                                :label="t('cms.sections.ctaLink')"
                                :hint="t('cms.sections.ctaLinkHint')"
                                placeholder="/search"
                            />
                        </div>

                        <div
                            v-for="option in BLOCKS[current.kind].options" :key="option"
                            class="tm-builder__field"
                        >
                            <span class="tm-builder__label">{{ t(`cms.sections.options.${option}`) }}</span>
                            <Tabs
                                :model-value="String(current.settings[option])"
                                :items="optionTabs(option)"
                                variant="segment"
                                :aria-label="t(`cms.sections.options.${option}`)"
                                @update:model-value="value => setOption(current!, option, value)"
                            />
                        </div>

                        <div v-if="BLOCKS[current.kind].image" class="tm-builder__field">
                            <span class="tm-builder__label">{{ fieldLabel(current, 'image') }}</span>
                            <FileUpload
                                :accept="['image/png', 'image/jpeg', 'image/webp']"
                                :max-size="8 * 1024 * 1024"
                                :current="current.settings.imageUrl || null"
                                :hint="uploading === current.key ? t('cms.lists.uploading') : t('cms.sections.imageHint')"
                                :disabled="uploading === current.key"
                                :library="mediaLibrary"
                                override
                                @update:model-value="file => file && pickImage(current!, file)"
                                @pick="url => (current!.settings.imageUrl = url)"
                                @clear="current!.settings.imageUrl = ''"
                                @discard="discardImage"
                            />
                        </div>

                        <Combobox
                            v-if="BLOCKS[current.kind].pickPost"
                            :model-value="current.postIds[0] ?? ''"
                            variant="field"
                            :label="t('cms.sections.featuredPost')"
                            :options="featuredOptions"
                            :note="t('cms.sections.featuredHint')"
                            @update:model-value="value => (current!.postIds = value ? [value] : [])"
                        />

                        <template v-if="BLOCKS[current.kind].feed">
                            <div class="tm-builder__field">
                                <span class="tm-builder__label">{{ t('cms.sections.pageSize') }}</span>
                                <Tabs
                                    :model-value="String(current.settings.pageSize)"
                                    :items="FEED_PAGE_SIZES.map(size => ({ value: String(size), label: String(size) }))"
                                    variant="segment"
                                    :aria-label="t('cms.sections.pageSize')"
                                    @update:model-value="value => (current!.settings.pageSize = Number(value))"
                                />
                                <span class="tm-builder__help">{{ t('cms.sections.pageSizeHint') }}</span>
                            </div>
                            <Checkbox v-model="current.settings.excludeFeatured" :label="t('cms.sections.excludeFeatured')" />
                        </template>

                        <div v-if="BLOCKS[current.kind].sources.length > 1" class="tm-builder__field">
                            <span class="tm-builder__label">{{ t('cms.sections.source') }}</span>
                            <Tabs
                                v-model="current.source" :items="sourceTabs(current.kind)" variant="segment"
                                :aria-label="t('cms.sections.source')"
                            />
                        </div>

                        <div v-if="current.source === 'list'" class="tm-builder__field">
                            <Combobox
                                v-model="current.listId"
                                variant="field"
                                :label="t('cms.sections.list')"
                                :options="listOptions(current.kind)"
                                :placeholder="t('cms.sections.listPlaceholder')"
                                :note="listOptions(current.kind).length ? undefined : t('cms.sections.noLists', { kind: t(`cms.blocks.kinds.${current.kind}`) })"
                            />
                            <NuxtLink
                                :to="localePath(current.listId ? `/app/content/lists/${current.listId}` : '/app/content/lists')"
                                class="tm-builder__link"
                            >
                                {{ current.listId ? t('cms.sections.editList') : t('cms.sections.createList') }}
                                <Icon name="arrow-right" :size="14" />
                            </NuxtLink>
                        </div>

                        <MultiSelect
                            v-else-if="current.source === 'posts' && !BLOCKS[current.kind].pickPost && !BLOCKS[current.kind].feed"
                            v-model="current.postIds"
                            :label="t('cms.sections.articles')"
                            :options="postOptions"
                            :placeholder="t('cms.sections.articlesLatest')"
                            :empty-label="t('cms.posts.empty')"
                            :note="current.postIds.length ? undefined : t('cms.sections.postsHint')"
                        />

                        <div v-if="BLOCKS[current.kind].layout" class="tm-builder__field">
                            <span class="tm-builder__label">{{ t('cms.sections.layout') }}</span>
                            <LayoutPicker
                                v-model="current.layoutId"
                                :options="layoutChoices"
                                :label="t('cms.sections.layout')"
                                :add-label="t('cms.sections.layouts.custom')"
                                @add="openLayout(current.key)"
                            />
                            <p v-if="overflow(current)" class="tm-builder__note">
                                {{ t('cms.sections.overflow', overflow(current)!) }}
                            </p>
                        </div>

                        <Input
                            v-if="BLOCKS[current.kind].link && !BLOCKS[current.kind].cta"
                            v-model="current.link"
                            :label="t('cms.sections.link')"
                            :hint="t('cms.sections.linkHint')"
                            placeholder="/search"
                        />

                        <Input
                            v-model="current.anchor"
                            :label="t('cms.sections.anchor')"
                            :hint="t(page === 'home' ? 'cms.sections.anchorHint' : 'cms.sections.anchorHintBlog')"
                            placeholder="hot"
                        />

                        <button
                            type="button" role="switch" class="tm-builder__switch"
                            :aria-checked="current.isPublished"
                            @click="current.isPublished = !current.isPublished"
                        >
                            <span class="tm-builder__switch-track"><span /></span>
                            <span>
                                <strong>{{ current.isPublished ? t('cms.sections.shown') : t('cms.sections.hidden') }}</strong>
                                <small>{{ current.isPublished ? t('cms.builder.shownHint') : t('cms.builder.hiddenHint') }}</small>
                            </span>
                        </button>
                    </div>

                    <footer class="tm-builder__inspector-foot">
                        <Button type="button" variant="ghost" size="sm" icon="copy" @click="onAction(current.key, 'duplicate')">
                            {{ t('cms.builder.actions.duplicate') }}
                        </Button>
                        <Button type="button" variant="danger-quiet" size="sm" icon="trash" @click="onAction(current.key, 'remove')">
                            {{ t('cms.builder.actions.remove') }}
                        </Button>
                    </footer>
                </template>

                <template v-else>
                    <header class="tm-builder__inspector-head">
                        <span class="tm-builder__kind"><Icon name="settings" :size="20" /></span>
                        <div>
                            <strong>{{ t('cms.builder.pageSettings') }}</strong>
                            <span>{{ t('cms.builder.pageSettingsHint') }}</span>
                        </div>
                    </header>

                    <div v-if="meta" class="tm-builder__fields">
                        <span class="tm-builder__label">{{ t('cms.pages.seo.title') }} · {{ locale.toUpperCase() }}</span>
                        <p class="tm-builder__help">{{ t('cms.pages.seo.lead') }}</p>
                        <Input
                            v-model="meta.seo[locale].title"
                            :label="t('cms.pages.seo.metaTitle')"
                            :hint="t('cms.pages.seo.length', { n: meta.seo[locale].title.length, max: 60 })"
                        />
                        <Input
                            v-model="meta.seo[locale].description"
                            :label="t('cms.pages.seo.metaDescription')"
                            :hint="t('cms.pages.seo.length', { n: meta.seo[locale].description.length, max: 160 })"
                            :rows="3"
                        />
                    </div>

                    <ul class="tm-builder__tips">
                        <li><Icon name="plus" :size="16" />{{ t('cms.builder.tips.add') }}</li>
                        <li><Icon name="grip" :size="16" />{{ t('cms.builder.tips.move') }}</li>
                        <li><Icon name="pencil" :size="16" />{{ t('cms.builder.tips.edit') }}</li>
                    </ul>
                </template>
            </aside>
        </div>

        <Transition name="tm-builder-toast">
            <div v-if="removed" class="tm-builder__toast" role="status">
                {{ t('cms.sections.removedNote', { title: headingOf(removed.section) }) }}
                <button type="button" class="tm-builder__undo" @click="undoRemove">
                    <Icon name="undo" :size="15" />
                    {{ t('cms.sections.undo') }}
                </button>
            </div>
        </Transition>

        <Modal
            v-model="newLayout.open"
            :title="t('cms.sections.layouts.title')"
            :description="t('cms.sections.layouts.lead')"
            :confirm-label="t('cms.sections.layouts.submit')"
            :busy="newLayout.saving"
            :error="newLayout.error"
            size="sm"
            @confirm="submitLayout"
        >
            <Input v-model="newLayout.name" :label="t('cms.sections.layouts.name')" :placeholder="t('cms.sections.layouts.namePlaceholder')" />
            <Input
                v-model="newLayout.grid"
                :label="t('cms.sections.layouts.grid')"
                :hint="t('cms.sections.layouts.gridHint')"
                placeholder="4_4_4_4_4_4"
            />
        </Modal>
    </div>
</template>

<script setup lang="ts">
import BuilderSplash from '~/modules/content/components/builderSplash/BuilderSplash.vue'
import LayoutPicker from '~/modules/content/components/layoutPicker/LayoutPicker.vue'
import LangSwitch from '~/modules/content/components/langSwitch/LangSwitch.vue'
import BlockPalette from '~/modules/content/components/blockPalette/BlockPalette.vue'
import BuilderCanvas from '~/modules/content/components/builderCanvas/BuilderCanvas.vue'
import RichEditor from '~/shared/components/richEditor/RichEditor.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import MultiSelect from '~/shared/components/multiSelect/MultiSelect.vue'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { BANNER_STYLES, BLOCKS, BLOCK_TONES, FEED_PAGE_SIZES, IMAGE_SIDES, SPOTLIGHT_SIZES } from '~/modules/content/contracts/blocks'
import { excerptFrom } from '~/shared/helpers/markdown'
import { DEVICES } from '~/modules/content/contracts/builder'
import type { BlockField, BlockOption, ContentPage, SectionKind } from '~/modules/content/contracts/blocks'
import type { BlockAction, DeviceKind } from '~/modules/content/contracts/builder'
import { useSections } from './Sections.hooks'
import type { IDraftSection } from './Sections.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const page = (route.meta.contentPage as ContentPage | undefined) ?? 'home'

const {
  kinds, meta, uploading, mediaLibrary, pickImage, discardImage,
  locale, draft, status, saving, dirty, selected, selectedSection: current, removed, context, problems,
  dragging, grabbed, startDrag, dragOver, endDrag,
  postOptions, listOptions, layoutChoices, listName, layoutName,
  overflow, missingLocales,
  newLayout, openLayout, submitLayout,
  add, duplicate, toggleHidden, remove, undoRemove, move, moveTo, select, reset, submit,
} = useSections(page)

const canvas = useTemplateRef<InstanceType<typeof BuilderCanvas>>('canvas')

const splashing = ref(true)
const frameReady = ref(false)
const splashSteps = computed(() => [1, 2, 3, 4].map(n => t(`cms.builder.splash.step${n}`)))

const device = ref<DeviceKind>('desktop')
const clean = ref(false)

const livePath = computed(() => localePath(page === 'blog' ? '/blog' : '/'))

const focusBlock = (key: string) => {
  select(key)
  canvas.value?.reveal(key)
}

const reveal = (key: string | null) => {
  if (key) void nextTick(() => canvas.value?.reveal(key))
}

const addBlock = (kind: SectionKind) => {
  const at = selected.value ? draft.value.findIndex(section => section.key === selected.value) + 1 : draft.value.length

  reveal(add(kind, at))
}

const insertAt = (kind: SectionKind, index: number) => {
  reveal(add(kind, index))
}

const onAction = (key: string, action: BlockAction) => {
  const index = draft.value.findIndex(section => section.key === key)

  switch (action) {
    case 'up': move(index, index - 1); break
    case 'down': move(index, index + 1); break
    case 'duplicate': reveal(duplicate(key)); break
    case 'toggle': toggleHidden(key); break
    case 'remove': remove(key); break
  }
}

const sourceTabs = (kind: SectionKind) => BLOCKS[kind].sources.map(source => ({
  value: source,
  label: t(`cms.blocks.sources.${source}`),
}))

const headingOf = (section: IDraftSection) =>
  section.titles[locale.value].trim()
  || CONTENT_LOCALES.map(code => section.titles[code].trim()).find(Boolean)
  || excerptFrom(section.bodies[locale.value] || CONTENT_LOCALES.map(code => section.bodies[code]).find(Boolean), 48)
  || summaryOf(section)

const fieldLabel = (section: IDraftSection, field: BlockField) => {
  const custom = BLOCKS[section.kind].labels[field]

  if (custom) return t(`cms.sections.fieldLabels.${custom}`)

  if (field === 'title') return t(BLOCKS[section.kind].titleRequired ? 'cms.sections.heading' : 'cms.sections.headingOptional')

  return t(`cms.sections.${field === 'body' ? 'body' : field}`)
}

const OPTION_VALUES: Record<BlockOption, readonly (string | number)[]> = {
  style: BANNER_STYLES,
  tone: BLOCK_TONES,
  imageSide: IMAGE_SIDES,
  listSize: SPOTLIGHT_SIZES,
}

const optionTabs = (option: BlockOption) => OPTION_VALUES[option].map(value => ({
  value: String(value),
  label: option === 'listSize' ? String(value) : t(`cms.sections.optionValues.${option}.${value}`),
}))

const setOption = (section: IDraftSection, option: BlockOption, value: string) => {
  if (option === 'listSize') section.settings.listSize = Number(value)
  else if (option === 'style') section.settings.style = value as typeof BANNER_STYLES[number]
  else if (option === 'tone') section.settings.tone = value as typeof BLOCK_TONES[number]
  else section.settings.imageSide = value as typeof IMAGE_SIDES[number]
}

const summaryOf = (section: IDraftSection) => {
  const block = BLOCKS[section.kind]
  const kind = t(`cms.blocks.kinds.${section.kind}`)

  if (block.pickPost) return `${kind} · ${postOptions.value.find(option => option.value === section.postIds[0])?.label ?? t('cms.sections.featuredLatest')}`

  if (block.feed) return `${kind} · ${t('cms.sections.feedSummary', { n: section.settings.pageSize })}`

  if (section.source === 'list') return `${kind} · ${listName(section.listId) ?? t('cms.sections.noList')}`

  if (block.layout) return `${kind} · ${layoutName(section.layoutId) ?? t('cms.sections.noLayout')}`

  return kind
}

const featuredOptions = computed(() => [
  { value: '', label: t('cms.sections.featuredLatest'), group: t('cms.sections.featuredAuto') },
  ...postOptions.value.map(option => ({ ...option, group: t('cms.sections.featuredPick') })),
])

const missingFor = (section: IDraftSection | null): ContentLocale[] => {
  if (!section) return []

  const missing = missingLocales(section)

  return missing.length && (BLOCKS[section.kind].titleRequired || missing.length < CONTENT_LOCALES.length) ? missing : []
}

let dismiss: ReturnType<typeof setTimeout> | null = null

watch(removed, (value) => {
  if (dismiss) clearTimeout(dismiss)
  if (value) dismiss = setTimeout(() => (removed.value = null), 10000)
})

const onKey = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return

  if (clean.value) clean.value = false
  else if (selected.value && !(event.target as HTMLElement | null)?.closest('input, textarea, [role="dialog"]')) select(null)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (dismiss) clearTimeout(dismiss)
})

const { ask } = useConfirm()

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true

  return ask({ title: t('cms.sections.leave.title'), description: t('cms.sections.leave.lead'), confirmLabel: t('cms.sections.leave.confirm') })
})

useSeoMeta({ title: () => t(`cms.pages.${page}.title`), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_sections.scss';
</style>
