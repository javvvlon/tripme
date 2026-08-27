<template>
    <div class="tm-cms-sections">
        <SectionHead :level="1" :title="t('cms.sections.title')" :sub="t('cms.sections.lead')" />

        <EditorSkeleton v-if="status === 'pending'" variant="cards" />

        <template v-else>
        <Tabs
            v-model="locale" :items="localeTabs" variant="segment"
            :aria-label="t('cms.banner.languageTabs')" class="tm-cms-sections__langs"
        />

        <form class="tm-cms-sections__form" novalidate @submit.prevent="submit">
            <ol class="tm-cms-sections__items">
                <li
                    v-for="(section, index) in draft" :key="section.key"
                    class="tm-cms-sections__item" :class="{ 'is-draft': !section.isPublished }"
                >
                    <header class="tm-cms-sections__item-head">
                        <span class="tm-cms-sections__index">{{ index + 1 }}</span>

                        <Checkbox
                            v-model="section.isPublished"
                            :label="t('cms.sections.published')"
                        />

                        <div class="tm-cms-sections__tools">
                            <button
                                type="button" :disabled="index === 0"
                                :aria-label="t('cms.lists.moveUp')" :title="t('cms.lists.moveUp')"
                                @click="move(index, -1)"
                            >
                                <Icon name="chevron-up" :size="16" />
                            </button>
                            <button
                                type="button" :disabled="index === draft.length - 1"
                                :aria-label="t('cms.lists.moveDown')" :title="t('cms.lists.moveDown')"
                                @click="move(index, 1)"
                            >
                                <Icon name="chevron" :size="16" />
                            </button>
                            <button
                                type="button" class="tm-cms-sections__remove"
                                :aria-label="t('cms.sections.remove')" :title="t('cms.sections.remove')"
                                @click="remove(section.key)"
                            >
                                <Icon name="close" :size="16" />
                            </button>
                        </div>
                    </header>

                    <div class="tm-cms-sections__fields">
                        <Input
                            v-model="section.titles[locale]"
                            :label="t('cms.sections.heading')"
                            :placeholder="t('cms.sections.headingPlaceholder')"
                        />

                        <Input
                            v-model="section.link"
                            :label="t('cms.sections.link')"
                            :hint="t('cms.sections.linkHint')"
                            placeholder="/search"
                        />

                        <Combobox
                            v-model="section.listId"
                            :label="t('cms.sections.list')"
                            :options="listOptions"
                            :placeholder="t('cms.sections.listPlaceholder')"
                        />

                        <Combobox
                            v-model="section.layoutId"
                            :label="t('cms.sections.layout')"
                            :options="layoutOptions"
                            :placeholder="t('cms.sections.layoutPlaceholder')"
                        />
                    </div>

                    <p v-if="overflow(section)" class="tm-cms-sections__note">
                        {{ t('cms.sections.overflow', overflow(section)!) }}
                    </p>
                </li>
            </ol>

            <Button type="button" variant="ghost" block class="tm-cms-sections__add" @click="add">
                {{ t('cms.sections.add') }}
            </Button>

            <footer class="tm-cms-sections__foot">
                <p v-if="error" class="tm-cms-sections__error" role="alert">{{ error }}</p>
                <p v-else-if="saved" class="tm-cms-sections__saved" role="status">{{ t('cms.saved') }}</p>

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
import { useSections } from './Sections.hooks'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { IDraftSection } from './Sections.hooks'

const { t, locales } = useI18n()

const {
  locale, draft, status, saving, saved, error,
  listOptions, layoutOptions, capacityOf, itemsIn,
  add, remove, move, submit,
} = useSections()

const localeTabs = computed(() => CONTENT_LOCALES.map(code => ({
  value: code,
  label: (locales.value as LocaleObject[]).find(l => l.code === code)?.name ?? code,
})))

function overflow(section: IDraftSection): { items: number, capacity: number } | null {
  const capacity = capacityOf(section.layoutId)
  const items = itemsIn(section.listId)

  if (capacity === null || items === null || items <= capacity) return null

  return { items, capacity }
}

useSeoMeta({ title: () => t('cms.sections.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_sections.scss';
</style>
