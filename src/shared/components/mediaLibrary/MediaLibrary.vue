<template>
    <Modal
        v-model="open"
        :title="t('media.title')"
        :description="t('media.lead')"
        :size="ModalSize.Medium"
        :busy="busy"
        :error="error"
        :footer="false"
    >
        <div class="tm-media__toolbar">
            <div class="tm-media__search">
                <Icon name="search" :size="16" />
                <input
                    v-model="query"
                    type="search"
                    :placeholder="t('media.search')"
                    :aria-label="t('media.search')"
                >
            </div>

            <Button type="button" size="sm" icon="upload" :disabled="busy" @click="file?.click()">
                {{ t('media.upload') }}
            </Button>
        </div>

        <div class="tm-media__folders">
            <button
                type="button" class="tm-media__folder"
                :class="{ 'is-active': folder === '' }"
                @click="pickFolder('')"
            >
                {{ t('media.folders.all') }}
            </button>

            <button
                v-for="entry in folders" :key="entry.id"
                type="button" class="tm-media__folder"
                :class="{ 'is-active': folder === entry.id }"
                @click="pickFolder(entry.id)"
            >
                <Icon name="folder" :size="13" />
                {{ entry.name }}
                <span class="tm-media__folder-count">{{ entry.count }}</span>
            </button>

            <button
                v-if="folders.length"
                type="button" class="tm-media__folder"
                :class="{ 'is-active': folder === 'none' }"
                @click="pickFolder('none')"
            >
                {{ t('media.folders.unfiled') }}
            </button>

            <button type="button" class="tm-media__folder tm-media__folder--add" @click="startFolder">
                + {{ t('media.folders.add') }}
            </button>
        </div>

        <div v-if="foldering" class="tm-media__folder-form">
            <Input v-model="folderName" :placeholder="t('media.folders.namePlaceholder')" @keydown.enter.prevent="saveFolder" />
            <Button size="sm" :disabled="busy" @click="saveFolder">{{ t('common.save') }}</Button>
            <Button size="sm" variant="ghost" @click="foldering = false">{{ t('common.cancel') }}</Button>
        </div>

        <div v-else-if="folder && folder !== 'none'" class="tm-media__folder-form">
            <Button size="sm" variant="ghost" icon="pencil" @click="startFolderRename">
                {{ t('media.folders.rename') }}
            </Button>
            <Button size="sm" variant="danger-quiet" :disabled="busy" @click="dropFolder">
                {{ t('media.folders.remove') }}
            </Button>
        </div>

        <p v-if="loading" class="tm-media__state">{{ t('common.loading') }}</p>

        <p v-else-if="!items.length" class="tm-media__state">
            {{ query ? t('media.noMatches') : (folder ? t('media.folders.empty') : t('media.empty')) }}
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
                            <Button size="sm" variant="ghost" @click="naming = false">{{ t('common.cancel') }}</Button>
                        </div>
                    </template>

                    <template v-else>
                        <p class="tm-media__name">{{ focused.title || fallbackName(focused) }}</p>
                        <p class="tm-media__facts">{{ facts(focused) }}</p>

                        <label v-if="folders.length" class="tm-media__filing">
                            <span>{{ t('media.folders.field') }}</span>
                            <select
                                :value="focused.folderId ?? ''"
                                :disabled="busy"
                                @change="fileInto(($event.target as HTMLSelectElement).value)"
                            >
                                <option value="">{{ t('media.folders.none') }}</option>
                                <option v-for="entry in folders" :key="entry.id" :value="entry.id">
                                    {{ entry.name }}
                                </option>
                            </select>
                        </label>
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
import type { IGalleryResult, IMediaFile, IMediaFolder, IMediaLibraryProps } from './MediaLibrary.d'

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
const {
  mediaLibrary, mediaFolders, removeMedia, describeMedia,
  createFolder, renameFolder, deleteFolder,
} = useMediaLibrary()
const { ask } = useConfirm()

const file = useTemplateRef<HTMLInputElement>('file')
const items = ref<IMediaFile[]>([])
const focused = ref<IMediaFile | null>(null)
const naming = ref(false)
const name = ref('')
const query = ref('')
const folder = ref('')
const folders = ref<IMediaFolder[]>([])
const foldering = ref(false)
const folderName = ref('')
const renamingFolder = ref<string | null>(null)
const loading = ref(false)
const busy = ref(false)
const error = ref('')

const load = async () => {
    error.value = ''
    loading.value = true

    try {
        items.value = await (props.library ?? mediaLibrary)(query.value, folder.value)
    }
    catch {
        error.value = t('media.failed')
    }
    finally {
        loading.value = false
    }
}

/**
 * Fetched once, on mount. The service mounts this only while it is open, so
 * there is no closed state to wait for — watching `open` for the way in was
 * why the gallery came up empty.
 */
const loadFolders = async () => {
  try {
    folders.value = await mediaFolders()
  }
  catch {
    folders.value = []
  }
}

onMounted(() => {
  void load()
  void loadFolders()
})

const pickFolder = (id: string) => {
  if (folder.value === id) return

  folder.value = id
  focused.value = null
  foldering.value = false

  void load()
}

const startFolder = () => {
  renamingFolder.value = null
  folderName.value = ''
  foldering.value = true
}

const startFolderRename = () => {
  renamingFolder.value = folder.value
  folderName.value = folders.value.find(entry => entry.id === folder.value)?.name ?? ''
  foldering.value = true
}

async function saveFolder() {
  const name = folderName.value.trim()

  if (!name) return

  busy.value = true
  error.value = ''

  try {
    if (renamingFolder.value) await renameFolder(renamingFolder.value, name)
    else folder.value = (await createFolder(name)).id

    foldering.value = false
    await loadFolders()
    await load()
  }
  catch {
    error.value = t('media.folders.failed')
  }
  finally {
    busy.value = false
  }
}

/**
 * Drops the folder, never what is in it — the files come back as unfiled.
 */
async function dropFolder() {
  const entry = folders.value.find(item => item.id === folder.value)

  if (!entry) return

  const answer = await ask({
    title: t('media.folders.confirmRemove.title'),
    description: t('media.folders.confirmRemove.lead'),
    subject: entry.name,
    confirmLabel: t('media.folders.remove'),
  })

  if (!answer) return

  busy.value = true

  try {
    await deleteFolder(entry.id)
    folder.value = ''
    await loadFolders()
    await load()
  }
  catch {
    error.value = t('media.folders.failed')
  }
  finally {
    busy.value = false
  }
}

/**
 * Files the previewed image. Only the label moves — the file keeps the key
 * it was uploaded under, so nothing pointing at it has to change.
 */
async function fileInto(id: string) {
  const target = focused.value

  if (!target) return

  busy.value = true
  error.value = ''

  try {
    await describeMedia(target.url, { folder: id || null })

    target.folderId = id || null

    await loadFolders()

    /** It has left the folder being viewed, so it leaves the list too. */
    if (folder.value && folder.value !== id && !(folder.value === 'none' && !id)) {
      items.value = items.value.filter(item => item.path !== target.path)
      focused.value = null
    }
  }
  catch {
    error.value = t('media.folders.failed')
  }
  finally {
    busy.value = false
  }
}

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
        await describeMedia(target.url, { title: name.value })
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
