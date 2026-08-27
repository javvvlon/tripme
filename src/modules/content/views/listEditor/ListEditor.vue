<template>
    <div class="tm-list-editor">
        <SectionHead :level="1" :title="name || t('cms.lists.untitled')" :sub="t('cms.lists.editorLead')" />

        <EditorSkeleton v-if="status === 'pending'" variant="cards" :count="3" />

        <template v-else>
        <Tabs
            v-model="locale" :items="localeTabs" variant="segment"
            :aria-label="t('cms.banner.languageTabs')" class="tm-list-editor__langs"
        />

        <form class="tm-list-editor__form" novalidate @submit.prevent="submit">
            <FormRow :label="t('cms.lists.name')" :for="nameId" required :hint="t('cms.lists.nameHint')">
                <Input :id="nameId" v-model="name" :placeholder="t('cms.lists.namePlaceholder')" />
            </FormRow>

            <ol class="tm-list-editor__items">
                <li v-for="(item, index) in items" :key="item.key" class="tm-list-editor__item">
                    <header class="tm-list-editor__item-head">
                        <span class="tm-list-editor__index">{{ index + 1 }}</span>

                        <div class="tm-list-editor__item-tools">
                            <button
                                type="button" :disabled="index === 0"
                                :aria-label="t('cms.lists.moveUp')" :title="t('cms.lists.moveUp')"
                                @click="move(index, -1)"
                            >
                                <Icon name="chevron-up" :size="16" />
                            </button>
                            <button
                                type="button" :disabled="index === items.length - 1"
                                :aria-label="t('cms.lists.moveDown')" :title="t('cms.lists.moveDown')"
                                @click="move(index, 1)"
                            >
                                <Icon name="chevron" :size="16" />
                            </button>
                            <button
                                type="button" class="tm-list-editor__remove"
                                :aria-label="t('cms.lists.removeItem')" :title="t('cms.lists.removeItem')"
                                @click="remove(item.key)"
                            >
                                <Icon name="close" :size="16" />
                            </button>
                        </div>
                    </header>

                    <div class="tm-list-editor__fields">
                        <Input
                            v-model="item.translations[locale].title"
                            :label="t('cms.lists.itemTitle')"
                            :placeholder="t('cms.lists.itemTitlePlaceholder')"
                        />

                        <Input
                            v-model="item.translations[locale].description"
                            :label="t('cms.lists.itemDescription')"
                            :placeholder="t('cms.lists.itemDescriptionPlaceholder')"
                        />

                        <Input
                            v-model="item.link"
                            :label="t('cms.lists.itemLink')"
                            :hint="t('cms.lists.itemLinkHint')"
                            placeholder="/search?from=tashkent&to=egypt"
                        />

                        <div class="tm-list-editor__image">
                            <span class="tm-list-editor__image-label">{{ t('cms.lists.itemImage') }}</span>

                            <FileUpload
                                :accept="['image/png', 'image/jpeg', 'image/webp']"
                                :max-size="8 * 1024 * 1024"
                                :current="item.imageUrl || null"
                                :hint="uploading === item.key ? t('cms.lists.uploading') : t('cms.lists.itemImageHint')"
                                :disabled="uploading === item.key"
                                override
                                @update:model-value="file => file && pickImage(item.key, file)"
                                @clear="clearImage(item.key)"
                                @discard="discardImage"
                            />
                        </div>

                        <Input
                            v-model="item.translations[locale].badgeLabel"
                            :label="t('cms.lists.badgeLabel')"
                            :hint="t('cms.lists.badgeHint')"
                            :placeholder="t('cms.lists.badgePlaceholder')"
                        />

                        <Combobox
                            v-model="item.badgeType"
                            :label="t('cms.lists.badgeType')"
                            :options="badgeOptions"
                            :placeholder="t('cms.lists.badgeNone')"
                            clearable
                        />
                    </div>

                    <p v-if="item.badgeType && !item.translations[locale].badgeLabel.trim()" class="tm-list-editor__note">
                        {{ t('cms.lists.badgeNeedsLabel') }}
                    </p>
                </li>
            </ol>

            <Button type="button" variant="ghost" block class="tm-list-editor__add" @click="add">
                {{ t('cms.lists.addItem') }}
            </Button>

            <footer class="tm-list-editor__foot">
                <Button type="button" variant="ghost" size="lg" @click="back">
                    {{ t('cms.back') }}
                </Button>

                <p v-if="error" class="tm-list-editor__error" role="alert">{{ error }}</p>
                <p v-else-if="saved" class="tm-list-editor__saved" role="status">{{ t('cms.saved') }}</p>

                <Button type="submit" size="lg" :disabled="saving">
                    {{ saving ? t('cms.saving') : t('cms.save') }}
                </Button>
            </footer>
        </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import { useListEditor } from './ListEditor.hooks'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { BADGE_TYPES } from '~/modules/content/contracts/blocks'

const { t, locales } = useI18n()
const route = useRoute()

const {
  locale, name, items, status, saving, saved, error, uploading,
  add, remove, move, submit, back, pickImage, clearImage, discardImage,
} = useListEditor(String(route.params.id))

const nameId = useId()

const badgeOptions = computed(() => BADGE_TYPES.map(type => ({
  value: type,
  label: t(`cms.lists.badgeTypes.${type}`),
})))

const localeTabs = computed(() => CONTENT_LOCALES.map(code => ({
  value: code,
  label: (locales.value as LocaleObject[]).find(l => l.code === code)?.name ?? code,
})))

useSeoMeta({ title: () => name.value || t('cms.lists.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_list-editor.scss';
</style>
