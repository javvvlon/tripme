<template>
    <div class="tm-cms-sections">
        <header class="tm-cms-sections__top">
            <SectionHead :level="1" :title="t(`cms.pages.${page}.title`)" :sub="t(`cms.pages.${page}.lead`)" />

            <div class="tm-cms-sections__modes">
                <Tabs
                    v-if="mode === 'preview'"
                    v-model="locale" :items="localeTabs" variant="segment"
                    :aria-label="t('cms.sections.previewLanguage')"
                />
                <Tabs v-model="mode" :items="modeTabs" variant="segment" :aria-label="t('cms.sections.mode')" />
            </div>
        </header>

        <EditorSkeleton v-if="status === 'pending'" variant="cards" />

        <template v-else-if="mode === 'edit'">
            <details v-if="meta" class="tm-cms-sections__seo">
                <summary>
                    <Icon name="search" :size="16" />
                    <span>{{ t('cms.pages.seo.title') }}</span>
                    <span class="tm-cms-sections__seo-hint">{{ t('cms.pages.seo.lead') }}</span>
                </summary>

                <div class="tm-cms-sections__seo-body">
                    <LangSwitch
                        v-model="seoLang"
                        :label="t('cms.sections.language')"
                        :missing="CONTENT_LOCALES.filter(code => !meta!.seo[code].title.trim())"
                        :missing-hint="t('cms.sections.notFilled')"
                        class="tm-cms-sections__lang"
                    />

                    <div class="tm-cms-sections__seo-grid">
                        <Input
                            v-model="meta.seo[seoLang].title"
                            :label="t('cms.pages.seo.metaTitle')"
                            :hint="t('cms.pages.seo.length', { n: meta.seo[seoLang].title.length, max: 60 })"
                        />
                        <Input
                            v-model="meta.seo[seoLang].description"
                            :label="t('cms.pages.seo.metaDescription')"
                            :hint="t('cms.pages.seo.length', { n: meta.seo[seoLang].description.length, max: 160 })"
                            :rows="2"
                        />
                    </div>
                </div>
            </details>

            <p v-if="!draft.length" class="tm-cms-sections__empty">{{ t('cms.sections.empty') }}</p>

            <ol class="tm-cms-sections__list">
                <li
                    v-for="(section, index) in draft" :key="section.key"
                    class="tm-cms-sections__section"
                    :class="{
                        'is-open': open === section.key,
                        'is-hidden': !section.isPublished,
                        'is-dragging': dragging === section.key,
                        'is-broken': problemOf(section),
                    }"
                    :draggable="grabbed === section.key"
                    @dragstart="startDrag(section.key, $event)"
                    @dragenter.prevent="dragOver(section.key)"
                    @dragover.prevent
                    @dragend="endDrag"
                    @drop.prevent="endDrag"
                >
                    <div class="tm-cms-sections__row">
                        <span
                            class="tm-cms-sections__grip" :title="t('cms.sections.drag')" aria-hidden="true"
                            @pointerdown="grabbed = section.key"
                            @pointerup="grabbed = null"
                        >
                            <Icon name="grip" :size="18" :stroke="3" />
                        </span>

                        <span class="tm-cms-sections__kind">
                            <Icon :name="BLOCKS[section.kind].icon" :size="18" />
                        </span>

                        <button
                            type="button" class="tm-cms-sections__summary"
                            :aria-expanded="open === section.key"
                            @click="toggle(section.key)"
                        >
                            <strong>{{ headingOf(section) }}</strong>
                            <span>{{ summaryOf(section) }}</span>
                        </button>

                        <span v-if="problemOf(section)" class="tm-cms-sections__flag tm-cms-sections__flag--danger">
                            {{ problemOf(section) }}
                        </span>
                        <span v-else-if="partlyTranslated(section)" class="tm-cms-sections__flag">
                            {{ t('cms.sections.missing', { locales: missingLocales(section).map(code => code.toUpperCase()).join(', ') }) }}
                        </span>

                        <LangSwitch
                            v-if="open === section.key"
                            :model-value="langOf(section.key)"
                            :label="t('cms.sections.language')"
                            :missing="missingFor(section)"
                            :missing-hint="t('cms.sections.notFilled')"
                            class="tm-cms-sections__lang"
                            @update:model-value="code => (langs[section.key] = code)"
                        />

                        <button
                            type="button" role="switch" class="tm-cms-sections__switch"
                            :aria-checked="section.isPublished"
                            @click="section.isPublished = !section.isPublished"
                        >
                            <span class="tm-cms-sections__switch-track"><span /></span>
                            {{ section.isPublished ? t('cms.sections.shown') : t('cms.sections.hidden') }}
                        </button>

                        <button
                            type="button" class="tm-cms-sections__chevron"
                            :aria-label="open === section.key ? t('cms.sections.collapse') : t('cms.sections.expand')"
                            @click="toggle(section.key)"
                        >
                            <Icon name="chevron" :size="18" />
                        </button>
                    </div>

                    <div v-if="open === section.key" class="tm-cms-sections__body">
                        <div class="tm-cms-sections__field">
                            <span class="tm-cms-sections__label">{{ t('cms.sections.type') }}</span>
                            <Tabs
                                :model-value="section.kind" :items="kindTabs" variant="segment"
                                :aria-label="t('cms.sections.type')"
                                @update:model-value="kind => setKind(section, kind as SectionKind)"
                            />
                        </div>

                        <Input
                            v-model="section.titles[langOf(section.key)]"
                            :label="`${t(BLOCKS[section.kind].titleRequired ? 'cms.sections.heading' : 'cms.sections.headingOptional')} · ${langOf(section.key).toUpperCase()}`"
                            :placeholder="t(`cms.sections.headingPlaceholders.${section.kind}`)"
                        />

                        <Input
                            v-if="BLOCKS[section.kind].subtitle"
                            v-model="section.subtitles[langOf(section.key)]"
                            :label="`${t('cms.sections.subtitle')} · ${langOf(section.key).toUpperCase()}`"
                            :placeholder="t('cms.sections.subtitlePlaceholder')"
                            :rows="3"
                        />

                        <div v-if="BLOCKS[section.kind].image" class="tm-cms-sections__field">
                            <span class="tm-cms-sections__label">{{ t('cms.sections.image') }}</span>
                            <FileUpload
                                :accept="['image/png', 'image/jpeg', 'image/webp']"
                                :max-size="8 * 1024 * 1024"
                                :current="section.settings.imageUrl || null"
                                :hint="uploading === section.key ? t('cms.lists.uploading') : t('cms.sections.imageHint')"
                                :disabled="uploading === section.key"
                                :library="mediaLibrary"
                                override
                                @update:model-value="file => file && pickImage(section, file)"
                                @pick="url => (section.settings.imageUrl = url)"
                                @clear="section.settings.imageUrl = ''"
                                @discard="discardImage"
                            />
                        </div>

                        <Combobox
                            v-if="BLOCKS[section.kind].pickPost"
                            :model-value="section.postIds[0] ?? ''"
                            variant="field"
                            :label="t('cms.sections.featuredPost')"
                            :options="featuredOptions"
                            :note="t('cms.sections.featuredHint')"
                            @update:model-value="value => (section.postIds = value ? [value] : [])"
                        />

                        <div v-if="BLOCKS[section.kind].feed" class="tm-cms-sections__pair">
                            <div class="tm-cms-sections__field">
                                <span class="tm-cms-sections__label">{{ t('cms.sections.pageSize') }}</span>
                                <Tabs
                                    :model-value="String(section.settings.pageSize)"
                                    :items="FEED_PAGE_SIZES.map(size => ({ value: String(size), label: String(size) }))"
                                    variant="segment"
                                    :aria-label="t('cms.sections.pageSize')"
                                    @update:model-value="value => (section.settings.pageSize = Number(value))"
                                />
                                <span class="tm-cms-sections__help">{{ t('cms.sections.pageSizeHint') }}</span>
                            </div>
                            <Checkbox
                                v-model="section.settings.excludeFeatured"
                                :label="t('cms.sections.excludeFeatured')"
                                class="tm-cms-sections__check"
                            />
                        </div>

                        <div v-if="BLOCKS[section.kind].sources.length > 1" class="tm-cms-sections__field">
                            <span class="tm-cms-sections__label">{{ t('cms.sections.source') }}</span>
                            <Tabs
                                v-model="section.source" :items="sourceTabs(section.kind)" variant="segment"
                                :aria-label="t('cms.sections.source')"
                            />
                        </div>

                        <div v-if="section.source === 'list'" class="tm-cms-sections__pair">
                            <Combobox
                                v-model="section.listId"
                                variant="field"
                                :label="t('cms.sections.list')"
                                :options="listOptions(section.kind)"
                                :placeholder="t('cms.sections.listPlaceholder')"
                                :note="listOptions(section.kind).length ? undefined : t('cms.sections.noLists', { kind: t(`cms.blocks.kinds.${section.kind}`) })"
                            />

                            <NuxtLink
                                :to="localePath(section.listId ? `/app/content/lists/${section.listId}` : '/app/content/lists')"
                                class="tm-cms-sections__aside-link"
                            >
                                {{ section.listId ? t('cms.sections.editList') : t('cms.sections.createList') }}
                                <Icon name="arrow-right" :size="14" />
                            </NuxtLink>
                        </div>

                        <MultiSelect
                            v-else-if="section.source === 'posts' && !BLOCKS[section.kind].pickPost && !BLOCKS[section.kind].feed"
                            v-model="section.postIds"
                            :label="t('cms.sections.articles')"
                            :options="postOptions"
                            :placeholder="t('cms.sections.articlesLatest')"
                            :empty-label="t('cms.posts.empty')"
                            :note="section.postIds.length ? undefined : t('cms.sections.postsHint')"
                        />

                        <div v-if="BLOCKS[section.kind].layout" class="tm-cms-sections__field">
                            <span class="tm-cms-sections__label">{{ t('cms.sections.layout') }}</span>
                            <LayoutPicker
                                v-model="section.layoutId"
                                :options="layoutChoices"
                                :label="t('cms.sections.layout')"
                                :add-label="t('cms.sections.layouts.custom')"
                                @add="openLayout(section.key)"
                            />
                            <p v-if="overflow(section)" class="tm-cms-sections__note">
                                {{ t('cms.sections.overflow', overflow(section)!) }}
                            </p>
                        </div>

                        <div class="tm-cms-sections__pair">
                            <Input
                                v-if="BLOCKS[section.kind].link"
                                v-model="section.link"
                                :label="t('cms.sections.link')"
                                :hint="t('cms.sections.linkHint')"
                                placeholder="/search"
                            />
                            <Input
                                v-model="section.anchor"
                                :label="t('cms.sections.anchor')"
                                :hint="t(page === 'home' ? 'cms.sections.anchorHint' : 'cms.sections.anchorHintBlog')"
                                placeholder="hot"
                            />
                        </div>

                        <footer class="tm-cms-sections__body-foot">
                            <div class="tm-cms-sections__order">
                                <button
                                    type="button" :disabled="index === 0"
                                    :aria-label="t('cms.lists.moveUp')" :title="t('cms.lists.moveUp')"
                                    @click="move(index, index - 1)"
                                >
                                    <Icon name="chevron-up" :size="16" />
                                </button>
                                <button
                                    type="button" :disabled="index === draft.length - 1"
                                    :aria-label="t('cms.lists.moveDown')" :title="t('cms.lists.moveDown')"
                                    @click="move(index, index + 1)"
                                >
                                    <Icon name="chevron" :size="16" />
                                </button>
                            </div>

                            <Button type="button" variant="danger-quiet" size="sm" icon="trash" @click="remove(section.key)">
                                {{ t('cms.sections.remove') }}
                            </Button>
                        </footer>
                    </div>
                </li>
            </ol>

            <button type="button" class="tm-cms-sections__add" @click="adding = true">
                <Icon name="plus" :size="18" />
                {{ t('cms.sections.add') }}
            </button>
        </template>

        <div v-else class="tm-cms-sections__preview">
            <Spinner v-if="previewing" />

            <p v-else-if="!draft.length" class="tm-cms-sections__empty">{{ t('cms.sections.empty') }}</p>

            <template v-else>
                <div
                    v-for="section in draft" :key="section.key"
                    class="tm-cms-sections__preview-item" :class="{ 'is-hidden': !section.isPublished }"
                >
                    <span v-if="!section.isPublished" class="tm-cms-sections__preview-tag">{{ t('cms.sections.hidden') }}</span>

                    <ContentSection v-if="preview.get(section.key)" :section="preview.get(section.key)!" />

                    <p v-else class="tm-cms-sections__preview-empty">
                        {{ t('cms.sections.previewEmpty', { title: headingOf(section) }) }}
                    </p>
                </div>
            </template>
        </div>

        <Modal
            v-model="adding"
            :title="t('cms.sections.addTitle')"
            :description="t('cms.sections.addLead')"
            :confirm-label="t('cms.sections.addConfirm')"
            size="sm"
            @confirm="confirmAdd"
        >
            <KindPicker v-model="newKind" :kinds="kinds" :label="t('cms.sections.type')" />
        </Modal>

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

        <Transition name="tm-cms-sections-bar">
            <div v-if="dirty || removed" class="tm-cms-sections__bar" role="region" :aria-label="t('cms.sections.changes')">
                <p class="tm-cms-sections__bar-text">
                    <template v-if="removed">
                        {{ t('cms.sections.removedNote', { title: headingOf(removed.section) }) }}
                        <button type="button" class="tm-cms-sections__undo" @click="undoRemove">
                            <Icon name="undo" :size="15" />
                            {{ t('cms.sections.undo') }}
                        </button>
                    </template>
                    <template v-else>{{ t('cms.sections.unsaved') }}</template>
                </p>

                <div class="tm-cms-sections__bar-actions">
                    <Button v-if="dirty" type="button" variant="ghost" size="md" :disabled="saving" @click="reset">
                        {{ t('cms.sections.discard') }}
                    </Button>
                    <Button v-if="dirty" type="button" size="md" :disabled="saving" @click="submit">
                        {{ saving ? t('cms.saving') : t('cms.save') }}
                    </Button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import KindPicker from '~/modules/content/components/kindPicker/KindPicker.vue'
import LayoutPicker from '~/modules/content/components/layoutPicker/LayoutPicker.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import MultiSelect from '~/shared/components/multiSelect/MultiSelect.vue'
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import LangSwitch from '~/modules/content/components/langSwitch/LangSwitch.vue'
import { BLOCKS, FEED_PAGE_SIZES } from '~/modules/content/contracts/blocks'
import type { ContentPage, SectionKind } from '~/modules/content/contracts/blocks'
import { useSections } from './Sections.hooks'
import type { IDraftSection } from './Sections.hooks'

const { t, locales } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const page = (route.meta.contentPage as ContentPage | undefined) ?? 'home'

const {
  kinds, meta, uploading, mediaLibrary, pickImage, discardImage,
  locale, mode, draft, status, saving, dirty, open, removed, preview, previewing,
  dragging, grabbed, startDrag, dragOver, endDrag,
  postOptions, listOptions, layoutChoices, listName, layoutName,
  overflow, missingLocales, problemOf,
  newLayout, openLayout, submitLayout,
  setKind, add, remove, undoRemove, move, toggle, reset, submit,
} = useSections(page)

const adding = ref(false)
const newKind = ref<SectionKind>(kinds[0]!)

const confirmAdd = () => {
  add(newKind.value)
  adding.value = false
}

const localeTabs = computed(() => CONTENT_LOCALES.map(code => ({
  value: code,
  label: (locales.value as LocaleObject[]).find(l => l.code === code)?.name ?? code,
})))

const modeTabs = computed(() => [
  { value: 'edit', label: t('cms.sections.modes.edit'), icon: 'pencil' },
  { value: 'preview', label: t('cms.sections.modes.preview'), icon: 'eye' },
])

const kindTabs = computed(() => kinds.map(kind => ({
  value: kind,
  label: t(`cms.blocks.kinds.${kind}`),
  icon: BLOCKS[kind].icon,
})))

const sourceTabs = (kind: SectionKind) => BLOCKS[kind].sources.map(source => ({
  value: source,
  label: t(`cms.blocks.sources.${source}`),
}))

const headingOf = (section: IDraftSection) =>
  section.titles[locale.value].trim()
  || CONTENT_LOCALES.map(code => section.titles[code].trim()).find(Boolean)
  || (BLOCKS[section.kind].titleRequired ? t('cms.sections.untitled') : t(`cms.blocks.kinds.${section.kind}`))

const summaryOf = (section: IDraftSection) => {
  const parts = [t(`cms.blocks.kinds.${section.kind}`)]
  const block = BLOCKS[section.kind]

  if (block.image) {
    parts.push(section.settings.imageUrl ? t('cms.sections.withImage') : t('cms.sections.noImage'))
  }
  else if (block.pickPost) {
    const picked = postOptions.value.find(option => option.value === section.postIds[0])

    parts.push(picked?.label ?? t('cms.sections.featuredLatest'))
  }
  else if (block.feed) {
    parts.push(t('cms.sections.feedSummary', { n: section.settings.pageSize }))
  }
  else if (section.source === 'posts') {
    parts.push(section.postIds.length
      ? t('cms.sections.pickedArticles', { count: section.postIds.length })
      : t('cms.sections.latestArticles'))
  }
  else {
    parts.push(listName(section.listId) ?? t('cms.sections.noList'))
  }

  if (BLOCKS[section.kind].layout) parts.push(layoutName(section.layoutId) ?? t('cms.sections.noLayout'))

  return parts.join(' · ')
}

const featuredOptions = computed(() => [
  { value: '', label: t('cms.sections.featuredLatest'), group: t('cms.sections.featuredAuto') },
  ...postOptions.value.map(option => ({ ...option, group: t('cms.sections.featuredPick') })),
])

const langs = reactive<Record<string, ContentLocale>>({})

const langOf = (key: string): ContentLocale => langs[key] ?? CMS_DEFAULT_LOCALE

const seoLang = ref<ContentLocale>(CMS_DEFAULT_LOCALE)

const missingFor = (section: IDraftSection): ContentLocale[] =>
  partlyTranslated(section) ? missingLocales(section) : []

const partlyTranslated = (section: IDraftSection) => {
  const missing = missingLocales(section).length

  return missing > 0 && (BLOCKS[section.kind].titleRequired || missing < CONTENT_LOCALES.length)
}

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
