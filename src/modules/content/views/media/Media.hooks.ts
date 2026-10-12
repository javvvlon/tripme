import type { IMediaFile, IMediaFolder } from '~/shared/components/mediaLibrary/MediaLibrary.d'
import type { IMediaUseRaw } from '~/modules/content/contracts/blocks'
import { MEDIA_ACCEPT, MEDIA_MAX_BYTES, MEDIA_PAGE_SIZE, MEDIA_TITLE_MAX, MEDIA_UNFILED } from './Media.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMediaPage = () => {
  const { t } = useI18n()
  const toast = useToast()
  const {
    mediaLibrary, mediaFolders, createFolder, renameFolder, deleteFolder,
    removeMedia, describeMedia, uploadMedia, duplicateMedia, mediaUsage,
  } = useMediaLibrary()

  const items = ref<IMediaFile[]>([])
  const folders = ref<IMediaFolder[]>([])
  const folder = ref('')
  const query = ref('')
  const limit = ref(MEDIA_PAGE_SIZE)
  const loading = ref(true)
  const failed = ref(false)

  const focusedPath = ref<string | null>(null)
  const selected = ref<string[]>([])
  const uses = ref<IMediaUseRaw[] | null>(null)
  const size = ref<{ w: number, h: number } | null>(null)
  const title = ref('')
  const working = ref<'' | 'title' | 'folder' | 'duplicate' | 'move'>('')

  const upload = reactive({ done: 0, total: 0 })

  const visible = computed(() => items.value.slice(0, limit.value))
  const focused = computed(() => items.value.find(item => item.path === focusedPath.value) ?? null)
  const picked = computed(() => items.value.filter(item => selected.value.includes(item.path)))
  const selecting = computed(() => selected.value.length > 0)

  const load = async () => {
    loading.value = true
    failed.value = false

    try {
      items.value = await mediaLibrary(query.value, folder.value)

      if (focusedPath.value && !items.value.some(item => item.path === focusedPath.value)) focusedPath.value = null

      selected.value = selected.value.filter(path => items.value.some(item => item.path === path))
    }
    catch {
      failed.value = true
      items.value = []
    }
    finally {
      loading.value = false
    }
  }

  const loadFolders = async () => {
    folders.value = await mediaFolders().catch(() => [])
  }

  onMounted(() => {
    void load()
    void loadFolders()
  })

  let typing: ReturnType<typeof setTimeout> | null = null

  watch(query, () => {
    if (typing) clearTimeout(typing)

    typing = setTimeout(() => {
      limit.value = MEDIA_PAGE_SIZE
      void load()
    }, 300)
  })

  onScopeDispose(() => { if (typing) clearTimeout(typing) })

  const pickFolder = (id: string) => {
    if (folder.value === id) return

    folder.value = id
    limit.value = MEDIA_PAGE_SIZE
    selected.value = []
    void load()
  }

  watch(focused, async (item) => {
    uses.value = null
    size.value = null
    title.value = item?.title ?? ''

    if (!item) return

    const path = item.path

    try {
      const found = await mediaUsage(item.url)

      if (focusedPath.value === path) uses.value = found
    }
    catch {
      if (focusedPath.value === path) uses.value = []
    }
  })

  const focus = (item: IMediaFile) => {
    focusedPath.value = focusedPath.value === item.path ? null : item.path
  }

  const toggle = (item: IMediaFile) => {
    selected.value = selected.value.includes(item.path)
      ? selected.value.filter(path => path !== item.path)
      : [...selected.value, item.path]
  }

  const selectAll = () => { selected.value = visible.value.map(item => item.path) }

  const clearSelection = () => { selected.value = [] }

  const measured = (event: Event) => {
    const image = event.target as HTMLImageElement

    size.value = { w: image.naturalWidth, h: image.naturalHeight }
  }

  const fallbackName = (item: IMediaFile) => item.path.split('/').pop() ?? item.path

  const nameOf = (item: IMediaFile) => item.title || fallbackName(item)

  async function saveTitle() {
    const item = focused.value
    const next = title.value.trim().slice(0, MEDIA_TITLE_MAX)

    if (!item || next === item.title) return

    working.value = 'title'

    try {
      await describeMedia(item.url, { title: next })
      item.title = next
    }
    catch {
      toast.error(t('media.renameFailed'))
      title.value = item.title
    }
    finally {
      working.value = ''
    }
  }

  async function fileInto(files: IMediaFile[], id: string) {
    const target = id || null

    for (const item of files) {
      await describeMedia(item.url, { folder: target })
      item.folderId = target
    }

    await loadFolders()

    if (folder.value && folder.value !== id && !(folder.value === MEDIA_UNFILED && !id)) await load()
  }

  async function moveFocused(id: string) {
    const item = focused.value

    if (!item) return

    working.value = 'folder'

    try {
      await fileInto([item], id)
    }
    catch {
      toast.error(t('media.folders.failed'))
    }
    finally {
      working.value = ''
    }
  }

  async function moveSelected(id: string) {
    working.value = 'move'

    try {
      await fileInto(picked.value, id)
      toast.success(t('cms.media.moved'))
      selected.value = []
    }
    catch {
      toast.error(t('media.folders.failed'))
    }
    finally {
      working.value = ''
    }
  }

  async function duplicate() {
    const item = focused.value

    if (!item) return

    working.value = 'duplicate'

    try {
      const copy = await duplicateMedia(item.url)

      await load()
      await loadFolders()
      focusedPath.value = copy.path
      toast.success(t('cms.media.duplicated'))
    }
    catch {
      toast.error(t('cms.errors.save'))
    }
    finally {
      working.value = ''
    }
  }

  async function copyLink() {
    const item = focused.value

    if (!item) return

    try {
      await navigator.clipboard.writeText(item.url)
      toast.success(t('cms.media.linkCopied'))
    }
    catch {
      toast.error(t('quote.copyFailed'))
    }
  }

  const fileInput = ref<HTMLInputElement | null>(null)
  const dragging = ref(false)

  const browse = () => fileInput.value?.click()

  async function uploadFiles(list: FileList | File[] | null | undefined) {
    const files = Array.from(list ?? [])

    if (!files.length || upload.total) return

    const usable = files.filter((file) => {
      if (!MEDIA_ACCEPT.includes(file.type)) {
        toast.error(t('cms.media.badType', { name: file.name }))
        return false
      }

      if (file.size > MEDIA_MAX_BYTES) {
        toast.error(t('cms.media.tooLarge', { name: file.name }))
        return false
      }

      return true
    })

    if (!usable.length) return

    upload.done = 0
    upload.total = usable.length

    const into = folder.value && folder.value !== MEDIA_UNFILED ? folder.value : null

    for (const file of usable) {
      try {
        const url = await uploadMedia(file)

        if (into) await describeMedia(url, { folder: into })

        upload.done++
      }
      catch {
        toast.error(t('media.uploadFailed'))
      }
    }

    if (upload.done) toast.success(t('cms.media.uploaded', { n: upload.done }))

    upload.done = 0
    upload.total = 0

    await load()
    await loadFolders()
  }

  const onPicked = (event: Event) => {
    const input = event.target as HTMLInputElement

    void uploadFiles(input.files)
    input.value = ''
  }

  const dropped = (event: DragEvent) => {
    dragging.value = false
    void uploadFiles(event.dataTransfer?.files)
  }

  const removing = ref<IMediaFile[]>([])
  const removingOpen = ref(false)
  const removeBusy = ref(false)
  const removeError = ref('')

  const askRemove = (list: IMediaFile[]) => {
    if (!list.length) return

    removing.value = list
    removeError.value = ''
    removingOpen.value = true
  }

  const removingUsed = computed(() => removing.value.some(item => item.used > 0))

  async function confirmRemove() {
    removeBusy.value = true
    removeError.value = ''

    try {
      for (const item of removing.value) await removeMedia(item.url)

      const gone = new Set(removing.value.map(item => item.path))

      items.value = items.value.filter(item => !gone.has(item.path))
      selected.value = selected.value.filter(path => !gone.has(path))

      if (focusedPath.value && gone.has(focusedPath.value)) focusedPath.value = null

      removingOpen.value = false
      toast.success(t('cms.media.removed'))
      await loadFolders()
    }
    catch {
      removeError.value = t('media.removeFailed')
    }
    finally {
      removeBusy.value = false
    }
  }

  const folderOpen = ref(false)
  const folderName = ref('')
  const folderEditing = ref<string | null>(null)
  const folderBusy = ref(false)
  const folderError = ref('')

  const startFolder = (id: string | null = null) => {
    folderEditing.value = id
    folderName.value = id ? folders.value.find(entry => entry.id === id)?.name ?? '' : ''
    folderError.value = ''
    folderOpen.value = true
  }

  async function saveFolder() {
    const name = folderName.value.trim()

    if (!name) return

    folderBusy.value = true
    folderError.value = ''

    try {
      if (folderEditing.value) await renameFolder(folderEditing.value, name)
      else pickFolder((await createFolder(name)).id)

      folderOpen.value = false
      await loadFolders()
    }
    catch {
      folderError.value = t('media.folders.failed')
    }
    finally {
      folderBusy.value = false
    }
  }

  const dropFolderOpen = ref(false)
  const dropFolderBusy = ref(false)
  const dropFolderError = ref('')

  const currentFolder = computed(() => folders.value.find(entry => entry.id === folder.value) ?? null)

  async function confirmDropFolder() {
    const entry = currentFolder.value

    if (!entry) return

    dropFolderBusy.value = true
    dropFolderError.value = ''

    try {
      await deleteFolder(entry.id)
      dropFolderOpen.value = false
      folder.value = ''
      await loadFolders()
      await load()
    }
    catch {
      dropFolderError.value = t('media.folders.failed')
    }
    finally {
      dropFolderBusy.value = false
    }
  }

  return {
    items, visible, folders, folder, query, limit, loading, failed,
    focused, focus, selected, picked, selecting, toggle, selectAll, clearSelection,
    uses, size, measured, title, working, saveTitle, moveFocused, moveSelected, duplicate, copyLink,
    nameOf, pickFolder, upload, fileInput, dragging, browse, onPicked, dropped,
    removing, removingOpen, removeBusy, removeError, removingUsed, askRemove, confirmRemove,
    folderOpen, folderName, folderEditing, folderBusy, folderError, startFolder, saveFolder,
    currentFolder, dropFolderOpen, dropFolderBusy, dropFolderError, confirmDropFolder,
    reload: load,
  }
}
