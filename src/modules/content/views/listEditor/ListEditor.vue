<template>
    <div class="tm-list-studio">
        <header class="tm-list-studio__top">
            <button
                type="button" class="tm-list-studio__icon-button"
                :title="t('cms.back')" :aria-label="t('cms.back')"
                @click="back"
            >
                <Icon name="chevron-left" :size="18" />
            </button>

            <div class="tm-list-studio__title">
                <h1>{{ name || t('cms.lists.untitled') }}</h1>
                <span class="tm-list-studio__meta">
                    <Icon :name="BLOCKS[kind].icon" :size="14" />
                    {{ t(`cms.blocks.kinds.${kind}`) }} · {{ t('cms.lists.items', { count: items.length }) }}
                </span>
                <span class="tm-list-studio__state" :class="{ 'is-dirty': dirty }">
                    {{ dirty ? t('cms.builder.unsaved') : t('cms.builder.saved') }}
                </span>
            </div>

            <div class="tm-list-studio__actions">
                <LangSwitch
                    v-model="locale"
                    :label="t('cms.sections.language')"
                    :missing="CONTENT_LOCALES.filter(missingIn)"
                    :missing-hint="t('cms.sections.notFilled')"
                />
                <Button v-if="dirty" type="button" variant="ghost" size="md" :disabled="saving" @click="reset">
                    {{ t('cms.sections.discard') }}
                </Button>
                <Button type="button" size="md" :disabled="!dirty || saving" @click="submit">
                    {{ saving ? t('cms.saving') : t('cms.save') }}
                </Button>
            </div>
        </header>

        <EditorSkeleton v-if="status === 'pending'" variant="cards" :count="3" />

        <div v-else class="tm-list-studio__body">
            <main class="tm-list-studio__board" @click.self="select(null)">
                <ol class="tm-list-studio__grid" :class="`is-${kind}`" @click.self="select(null)">
                    <li
                        v-for="(item, index) in items" :key="item.key"
                        class="tm-list-studio__tile"
                        :class="{
                            'is-active': selected === item.key,
                            'is-dragging': dragging === item.key,
                            'is-missing': !item.translations[locale].title.trim(),
                        }"
                        draggable="true"
                        @click="select(item.key)"
                        @dragstart="startDrag(item.key, $event)"
                        @dragenter.prevent="dragOver(index)"
                        @dragover.prevent
                        @dragend="dragging = null"
                        @drop.prevent="dragging = null"
                    >
                        <span class="tm-list-studio__number">{{ index + 1 }}</span>

                        <template v-if="kind === 'cards'">
                            <span class="tm-list-studio__photo">
                                <img v-if="item.imageUrl" :src="item.imageUrl" alt="" loading="lazy">
                                <Icon v-else name="image" :size="28" />
                            </span>
                            <Badge v-if="item.badgeType && item.translations[locale].badgeLabel.trim()" :tone="item.badgeType" class="tm-list-studio__badge">
                                {{ item.translations[locale].badgeLabel }}
                            </Badge>
                            <Icon v-if="item.link" name="link" :size="15" class="tm-list-studio__linked" />
                            <span class="tm-list-studio__caption">
                                <strong>{{ titleOf(item) }}</strong>
                                <span v-if="item.translations[locale].description">{{ item.translations[locale].description }}</span>
                            </span>
                        </template>

                        <template v-else-if="kind === 'features'">
                            <span class="tm-list-studio__icon">
                                <img v-if="item.imageUrl" :src="item.imageUrl" alt="" loading="lazy">
                                <Icon v-else name="star" :size="24" />
                            </span>
                            <strong class="tm-list-studio__name">{{ titleOf(item) }}</strong>
                            <span class="tm-list-studio__text">{{ item.translations[locale].description }}</span>
                        </template>

                        <template v-else>
                            <span class="tm-list-studio__qa">
                                <strong class="tm-list-studio__name">{{ titleOf(item) }}</strong>
                                <span class="tm-list-studio__text">{{ item.translations[locale].description }}</span>
                            </span>
                            <Icon name="chevron" :size="18" class="tm-list-studio__fold" />
                        </template>
                    </li>

                    <li class="tm-list-studio__add-tile">
                        <button type="button" class="tm-list-studio__add" @click="add">
                            <Icon name="plus" :size="22" />
                            {{ t('cms.lists.addItem') }}
                        </button>
                    </li>
                </ol>
            </main>

            <aside class="tm-list-studio__panel">
                <template v-if="current">
                    <header class="tm-list-studio__panel-head">
                        <span class="tm-list-studio__panel-index">{{ items.indexOf(current) + 1 }}</span>
                        <strong>{{ titleOf(current) }}</strong>
                        <button
                            type="button" class="tm-list-studio__icon-button is-small"
                            :title="t('cms.builder.close')" :aria-label="t('cms.builder.close')"
                            @click="select(null)"
                        >
                            <Icon name="close" :size="16" />
                        </button>
                    </header>

                    <div class="tm-list-studio__fields">
                        <Input
                            v-model="current.translations[locale].title"
                            :label="`${t(kind === 'faq' ? 'cms.lists.question' : 'cms.lists.itemTitle')} · ${locale.toUpperCase()}`"
                            :placeholder="t(kind === 'faq' ? 'cms.lists.questionPlaceholder' : 'cms.lists.itemTitlePlaceholder')"
                        />

                        <Input
                            v-model="current.translations[locale].description"
                            :label="`${t(kind === 'faq' ? 'cms.lists.answer' : 'cms.lists.itemDescription')} · ${locale.toUpperCase()}`"
                            :placeholder="t(kind === 'faq' ? 'cms.lists.answerPlaceholder' : 'cms.lists.itemDescriptionPlaceholder')"
                            :rows="kind === 'faq' ? 6 : 3"
                        />

                        <div v-if="fields.image" class="tm-list-studio__field">
                            <span class="tm-list-studio__label">{{ t('cms.lists.itemImage') }}</span>
                            <FileUpload
                                :accept="['image/png', 'image/jpeg', 'image/webp']"
                                :max-size="8 * 1024 * 1024"
                                :current="current.imageUrl || null"
                                :hint="uploading === current.key ? t('cms.lists.uploading') : t('cms.lists.itemImageHint')"
                                :disabled="uploading === current.key"
                                :library="mediaLibrary"
                                override
                                @update:model-value="file => file && pickImage(current!.key, file)"
                                @pick="url => useStored(current!.key, url)"
                                @clear="clearImage(current!.key)"
                                @discard="discardImage"
                            />
                        </div>

                        <Input
                            v-if="fields.link"
                            v-model="current.link"
                            :label="t('cms.lists.itemLink')"
                            :hint="t('cms.lists.itemLinkHint')"
                            placeholder="/search?from=tashkent&to=egypt"
                        />

                        <div v-if="fields.badge" class="tm-list-studio__group">
                            <Input
                                v-model="current.translations[locale].badgeLabel"
                                :label="`${t('cms.lists.badgeLabel')} · ${locale.toUpperCase()}`"
                                :placeholder="t('cms.lists.badgePlaceholder')"
                            />
                            <div class="tm-list-studio__field">
                                <span class="tm-list-studio__label">{{ t('cms.lists.badgeType') }}</span>
                                <Tabs
                                    :model-value="current.badgeType || 'none'"
                                    :items="badgeTabs"
                                    variant="segment"
                                    :aria-label="t('cms.lists.badgeType')"
                                    @update:model-value="value => (current!.badgeType = value === 'none' ? '' : value as BadgeType)"
                                />
                            </div>
                            <p v-if="current.badgeType && !current.translations[locale].badgeLabel.trim()" class="tm-list-studio__note">
                                {{ t('cms.lists.badgeNeedsLabel') }}
                            </p>
                        </div>
                    </div>

                    <footer class="tm-list-studio__panel-foot">
                        <Button type="button" variant="ghost" size="sm" icon="copy" @click="duplicate(current.key)">
                            {{ t('cms.builder.actions.duplicate') }}
                        </Button>
                        <Button type="button" variant="danger-quiet" size="sm" icon="trash" @click="remove(current.key)">
                            {{ t('cms.builder.actions.remove') }}
                        </Button>
                    </footer>
                </template>

                <template v-else>
                    <header class="tm-list-studio__panel-head">
                        <span class="tm-list-studio__panel-index"><Icon name="settings" :size="16" /></span>
                        <strong>{{ t('cms.lists.settings') }}</strong>
                    </header>

                    <div class="tm-list-studio__fields">
                        <Input
                            v-model="name"
                            :label="t('cms.lists.name')"
                            :hint="t('cms.lists.nameHint')"
                            :placeholder="t('cms.lists.namePlaceholder')"
                        />

                        <div class="tm-list-studio__field">
                            <span class="tm-list-studio__label">{{ t('cms.lists.kind') }}</span>
                            <KindPicker
                                :model-value="kind"
                                :kinds="[...LIST_KINDS]"
                                :label="t('cms.lists.kind')"
                                @update:model-value="value => (kind = value as ListKind)"
                            />
                        </div>
                    </div>
                </template>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import LangSwitch from '~/modules/content/components/langSwitch/LangSwitch.vue'
import Badge from '~/shared/components/badge/Badge.vue'
import KindPicker from '~/modules/content/components/kindPicker/KindPicker.vue'
import { useListEditor } from './ListEditor.hooks'
import type { IDraftItem } from './ListEditor.hooks'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { BADGE_TYPES, BLOCKS, LIST_KINDS } from '~/modules/content/contracts/blocks'
import type { BadgeType, ListKind } from '~/modules/content/contracts/blocks'

const { t } = useI18n()
const route = useRoute()

const {
  locale, name, kind, fields, items, status, saving, uploading, selected, current, dirty,
  add, duplicate, remove, moveTo, select, reset, missingIn,
  submit, back, pickImage, clearImage, discardImage, useStored, mediaLibrary,
} = useListEditor(String(route.params.id))

const titleOf = (item: IDraftItem) =>
  item.translations[locale.value].title.trim()
  || CONTENT_LOCALES.map(code => item.translations[code].title.trim()).find(Boolean)
  || t('cms.lists.untitledItem')

const badgeTabs = computed(() => [
  { value: 'none', label: t('cms.lists.badgeNone') },
  ...BADGE_TYPES.map(type => ({ value: type, label: t(`cms.lists.badgeTypes.${type}`) })),
])

const dragging = ref<string | null>(null)

const startDrag = (key: string, event: DragEvent) => {
  dragging.value = key
  event.dataTransfer?.setData('text/plain', key)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const dragOver = (index: number) => {
  if (dragging.value) moveTo(dragging.value, index)
}

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !(event.target as HTMLElement | null)?.closest('input, textarea, [role="dialog"]')) select(null)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

const { ask } = useConfirm()

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true

  return ask({ title: t('cms.sections.leave.title'), description: t('cms.sections.leave.lead'), confirmLabel: t('cms.sections.leave.confirm') })
})

useSeoMeta({ title: () => name.value || t('cms.lists.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_list-editor.scss';
</style>
