<template>
    <Modal
        v-model="open"
        :title="t('media.title')"
        :description="t('media.lead')"
        :size="ModalSize.Medium"
        :busy="busy"
        :error="error"
        :cancel-label="t('common.close')"
        :confirm-label="t('media.upload')"
        @confirm="file?.click()"
    >
        <div class="tm-media__search">
            <Icon name="search" :size="16" />
            <input
                v-model="query"
                type="search"
                :placeholder="t('media.search')"
                :aria-label="t('media.search')"
            >
        </div>

        <p v-if="loading" class="tm-media__state">{{ t('common.loading') }}</p>

        <p v-else-if="!items.length" class="tm-media__state">
            {{ query ? t('media.noMatches') : t('media.empty') }}
        </p>

        <div v-else class="tm-media" :class="{ 'is-previewing': Boolean(focused) }">
            <ul class="tm-media__deck">
                <li v-for="item in items" :key="item.path">
                    <button
                        type="button" class="tm-media__slide"
                        :class="{ 'is-active': item.path === focused?.path, 'is-current': item.url === current }"
                        :aria-current="item.path === focused?.path"
                        @click="focused = item"
                    >
                        <img :src="item.url" :alt="item.title" loading="lazy">
                        <span v-if="item.url === current" class="tm-media__flag">
                            <Icon name="check" :size="12" />
                        </span>
                    </button>
                </li>
            </ul>

            <div v-if="focused" class="tm-media__stage">
                <button
                    type="button" class="tm-media__back"
                    :aria-label="t('media.back')" :title="t('media.back')"
                    @click="focused = null"
                >
                    <Icon name="chevron-left" :size="14" />
                    {{ t('media.back') }}
                </button>

                <div class="tm-media__canvas">
                    <img :key="focused.path" :src="focused.url" :alt="focused.title">
                </div>

                <div class="tm-media__meta">
                    <template v-if="naming">
                        <Input
                            v-model="name"
                            :label="t('media.name')"
                            :placeholder="t('media.namePlaceholder')"
                            @keydown.enter.prevent="rename"
                        />

                        <div class="tm-media__row">
                            <Button size="sm" :disabled="busy" @click="rename">{{ t('common.save') }}</Button>
                            <Button size="sm" variant="quiet" @click="naming = false">{{ t('common.cancel') }}</Button>
                        </div>
                    </template>

                    <template v-else>
                        <p class="tm-media__name">{{ focused.title || fallbackName(focused) }}</p>
                        <p class="tm-media__facts">{{ facts(focused) }}</p>
                    </template>
                </div>

                <div v-if="!naming" class="tm-media__tools">
                    <Button size="sm" :disabled="focused.url === current" @click="choose(focused.url)">
                        {{ focused.url === current ? t('media.chosen') : t('media.choose') }}
                    </Button>

                    <button
                        type="button" class="tm-media__tool"
                        :aria-label="t('media.rename')" :title="t('media.rename')"
                        @click="startNaming"
                    >
                        <Icon name="pencil" :size="16" />
                    </button>

                    <button
                        type="button" class="tm-media__tool tm-media__tool--danger"
                        :aria-label="t('media.remove')" :title="t('media.remove')"
                        :disabled="busy"
                        @click="destroy"
                    >
                        <Icon name="trash" :size="16" />
                    </button>
                </div>
            </div>
        </div>

        <input
            ref="file"
            type="file" class="tm-media__input"
            :accept="accept?.join(',')"
            @change="onFile"
        >
    </Modal>
</template>

<script setup lang="ts">
import Modal from '~/shared/components/modal/Modal.vue'
import Button from '~/shared/components/button/Button.vue'
import Input from '~/shared/components/input/Input.vue'
import Icon from '~/shared/components/icon/Icon.vue'
import { ModalSize } from '~/shared/components/modal/Modal.config'
import type { IGalleryResult, IMediaFile, IMediaLibraryProps } from './MediaLibrary.d'

const MAX_TITLE = 120

const props = defineProps<IMediaLibraryProps>()

const { resolve, dismiss } = useModalContext<IGalleryResult>()

/** Open for as long as the service keeps it mounted. */
const open = ref(true)
const current = computed(() => props.current ?? null)

/**
 * Deleting the picked file has to reach the field that pointed at it, but
 * the gallery stays open afterwards — so it is remembered and reported when
 * the gallery finally closes.
 */
const removedCurrent = ref<string | null>(null)

watch(open, (still) => { if (!still) finish() })

const finish = (url?: string) => {
  if (url || removedCurrent.value) resolve({ url, removed: removedCurrent.value ?? undefined })
  else dismiss()
}

const { t, locale } = useI18n()
const { mediaLibrary, removeMedia, renameMedia } = useMediaLibrary()
const { ask } = useConfirm()

const file = useTemplateRef<HTMLInputElement>('file')
const items = ref<IMediaFile[]>([])
const focused = ref<IMediaFile | null>(null)
const naming = ref(false)
const name = ref('')
const query = ref('')
const loading = ref(false)
const busy = ref(false)
const error = ref('')

const load = async () => {
    error.value = ''
    loading.value = true

    try {
        items.value = await (props.library ?? mediaLibrary)(query.value)
    }
    catch {
        error.value = t('media.failed')
    }
    finally {
        loading.value = false
    }
}

watch(open, (next) => {
    naming.value = false
    focused.value = null
    query.value = ''

    if (next) void load()
})

/**
 * Typing asks the API, so it waits for a pause rather than firing per
 * keystroke. Leaving the preview open would show a file the new results no
 * longer contain.
 */
let typing: ReturnType<typeof setTimeout> | null = null

watch(query, () => {
    if (!open.value) return

    if (typing) clearTimeout(typing)

    typing = setTimeout(() => {
        focused.value = null
        void load()
    }, 300)
})

onScopeDispose(() => { if (typing) clearTimeout(typing) })

const fallbackName = (item: IMediaFile) => item.path.split('/').pop() ?? item.path

const facts = (item: IMediaFile) => {
    const size = item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : ''
    const day = item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString(locale.value) : ''

    return [size, day].filter(Boolean).join(' · ')
}

function startNaming() {
    name.value = focused.value?.title || ''
    naming.value = true
}

function choose(url: string) {
    finish(url)
}

async function rename() {
    const target = focused.value

    if (!target) return

    busy.value = true
    error.value = ''

    try {
        await renameMedia(target.url, name.value)
        target.title = name.value.trim().slice(0, MAX_TITLE)
        naming.value = false
    }
    catch {
        error.value = t('media.renameFailed')
    }
    finally {
        busy.value = false
    }
}

/**
 * Deleting the bytes, not the reference. Anything already pointing at this
 * URL — a banner, a list item, an article — will stop resolving, which is
 * why it asks first and says so.
 */
async function destroy() {
    const target = focused.value

    if (!target) return

    const answer = await ask({
        title: t('media.confirmRemove.title'),
        description: t('media.confirmRemove.lead'),
        subject: target.title || fallbackName(target),
        confirmLabel: t('media.remove'),
    })

    if (!answer) return

    busy.value = true
    error.value = ''

    try {
        await removeMedia(target.url)

        items.value = items.value.filter(item => item.path !== target.path)
        focused.value = null

        if (target.url === current.value) removedCurrent.value = target.url
    }
    catch {
        error.value = t('media.removeFailed')
    }
    finally {
        busy.value = false
    }
}

async function onFile(event: Event) {
    const input = event.target as HTMLInputElement
    const chosen = input.files?.[0]

    input.value = ''

    if (!chosen || !props.uploader) return

    busy.value = true
    error.value = ''

    try {
        choose(await props.uploader(chosen))
    }
    catch {
        error.value = t('media.uploadFailed')
    }
    finally {
        busy.value = false
    }
}
</script>

<style lang="scss">
@use './_media-library.scss';
</style>
