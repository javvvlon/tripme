import { useMarketingRepository } from '~/modules/marketing/repositories'
import { AD_FORMATS, AD_INCLUDES, AD_LANGUAGES, AD_MOODS, AD_SIZES, AD_STYLES, CONTEXT_BACKDROPS, DEFAULT_DESIGN, MAX_BUTTONS } from '~/modules/marketing/contracts/marketing'
import type {
  AdBackdrop, AdButtons, AdFormat, AdInclude, AdLanguage, AdMood, AdStyle, IAdContact, IAdCopy, IAdDesign, IAdTemplate, IAdTour, IMarketingSettings, ISavedTemplate, ISelection,
} from '~/modules/marketing/contracts/marketing'
import { adText, amountOf, telegramPost } from '~/modules/marketing/helpers/ad'
import { download, fontsReady, loadImage, saveBlob, toBlob, toDataUrl } from '~/modules/marketing/helpers/banner/render'
import type { IBannerLabels, IBannerSpec } from '~/modules/marketing/helpers/banner/render'
import { DURATION } from '~/modules/marketing/helpers/video/motion'
import type { IMotionSpec } from '~/modules/marketing/helpers/video/motion'
import type { IVideoFile } from '~/modules/marketing/helpers/video/export'
import { tourFromTrip } from '~/modules/leads/helpers/quote'
import { readFailure } from '~/shared/services/ui/failure'
import { Modal } from '~/shared/services/ui/modals'
import type { IGalleryResult, IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const SITE = 'tripme.uz'

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const MAX_VIDEO_BYTES = 48 * 1024 * 1024

export type StudioPanel = 'image' | 'post' | 'video' | 'page' | 'tours'

type Busy = '' | 'recheck' | 'write' | 'paint' | 'background' | 'order' | 'archive' | 'publish' | 'download' | 'templates' | 'video'

const sameTemplate = (a: IAdTemplate | null | undefined, b: IAdTemplate | null | undefined): boolean =>
  Boolean(a && b) && JSON.stringify({ ...a, name: '' }) === JSON.stringify({ ...b, name: '' })

const blankCopy = (): IAdCopy => ({ kicker: '', headline: '', intro: '', cta: '', hashtags: [], ai: false })

export const useSelection = () => {
  const { t, locale } = useI18n()
  const { $i18n } = useNuxtApp()
  const route = useRoute()
  const localePath = useLocalePath()
  const { absolute } = useSiteUrl()
  const modal = useModal()
  const { mediaLibrary } = useMediaLibrary()
  const { failed, saved, fail } = useToast()
  const repository = useMarketingRepository()
  const { toUzs } = useUzsRates()

  const id = computed(() => String(route.params.id ?? ''))

  const { data, status } = useAsyncData(
    () => `cms:marketing:${id.value}`,
    () => repository.one(id.value).catch(() => null),
    { default: () => null, watch: [id] },
  )

  const { data: settingsData } = useAsyncData('cms:marketing:settings', () => repository.settings().catch(() => null), { default: () => null })

  const { data: savedData } = useAsyncData('cms:marketing:templates', () => repository.templates().catch(() => [] as ISavedTemplate[]), { default: () => [] as ISavedTemplate[] })

  const selection = computed<ISelection | null>(() => data.value)
  const settings = computed<IMarketingSettings | null>(() => settingsData.value)

  const set = (next: ISelection) => {
    data.value = next
    triggerRef(data)
  }

  const setSettings = (next: IMarketingSettings) => {
    settingsData.value = next
    triggerRef(settingsData)
  }

  const panel = ref<StudioPanel>('image')
  const format = ref<AdFormat>('story')
  const language = ref<AdLanguage>(locale.value === 'uz' ? 'uz' : 'ru')
  const ready = ref(false)
  const fonts = ref(false)
  const image = shallowRef<HTMLImageElement | null>(null)
  const busy = ref<Busy>('')
  const generation = ref(0)
  const templateGeneration = ref(0)
  const imageBlocked = ref('')
  const settingsOpen = ref(false)
  const settingsTab = ref<'voice' | 'visual' | 'managers'>('voice')
  const title = ref('')
  const design = reactive<IAdDesign>({ ...DEFAULT_DESIGN })
  const draft = reactive<Record<AdLanguage, IAdCopy>>({ ru: blankCopy(), uz: blankCopy() })
  const hashtags = reactive<Record<AdLanguage, string>>({ ru: '', uz: '' })
  const telegramImage = ref<string | null>(null)
  const videoProgress = ref(0)
  const videoReady = ref(true)

  const translate = (key: string, params: Record<string, unknown> = {}, plural?: number) =>
    plural === undefined
      ? t(key, params, { locale: language.value })
      : t(key, params, { locale: language.value, plural })

  watch(language, async (next) => {
    ready.value = false
    await $i18n.loadLocaleMessages(next).catch(() => undefined)
    ready.value = true
  }, { immediate: true })

  const syncDrafts = (next: ISelection | null) => {
    if (!next) return

    title.value = next.title
    Object.assign(design, DEFAULT_DESIGN, next.design)

    for (const lang of AD_LANGUAGES) {
      const copy = next.copy[lang] ?? blankCopy()

      Object.assign(draft[lang], copy, { hashtags: [...copy.hashtags] })
      hashtags[lang] = copy.hashtags.map(tag => `#${tag}`).join(' ')
    }
  }

  watch(() => selection.value?.id, () => syncDrafts(selection.value), { immediate: true })

  onMounted(async () => {
    await fontsReady('TripMe Дубай Toshkent ★ 1 234 567 $ so‘m')
    fonts.value = true
  })

  watch(() => selection.value?.background?.url ?? '', async (url) => {
    const loaded = url ? await loadImage(url) : null

    image.value = loaded?.naturalWidth ? markRaw(loaded) : null
  }, { immediate: true })

  const tagsOf = (value: string): string[] =>
    value.split(/[\s,]+/).map(tag => tag.replace(/^#/, '').trim().toLowerCase()).filter(Boolean)

  let copyTimer: ReturnType<typeof setTimeout> | null = null
  let designTimer: ReturnType<typeof setTimeout> | null = null

  async function saveCopy(lang: AdLanguage) {
    if (!selection.value) return

    try {
      set(await repository.patch(selection.value.id, { copy: { [lang]: { ...draft[lang], hashtags: tagsOf(hashtags[lang]) } } }))
    }
    catch (error) {
      failed(error)
    }
  }

  function edited(lang: AdLanguage = language.value) {
    if (copyTimer) clearTimeout(copyTimer)

    copyTimer = setTimeout(() => saveCopy(lang), 700)
  }

  function tune(changes: Partial<IAdDesign>) {
    Object.assign(design, changes)

    if (designTimer) clearTimeout(designTimer)

    designTimer = setTimeout(async () => {
      if (!selection.value) return

      try {
        set(await repository.patch(selection.value.id, { design: { ...design } }))
      }
      catch (error) {
        failed(error)
      }
    }, 400)
  }

  async function run(kind: Busy, action: () => Promise<ISelection>, message?: string): Promise<boolean> {
    busy.value = kind

    try {
      set(await action())

      if (message) saved(message)

      return true
    }
    catch (error) {
      failed(error)

      return false
    }
    finally {
      busy.value = ''
    }
  }

  async function saveTitle() {
    const next = title.value.trim()

    if (!selection.value || !next || next === selection.value.title) return

    await run('order', () => repository.patch(selection.value!.id, { title: next }))
  }

  const setStyle = (style: AdStyle) => {
    if (!selection.value || selection.value.style === style) return

    set({ ...selection.value, style })
    void repository.patch(selection.value.id, { style }).catch(failed)
  }

  const setBackdrop = (backdrop: AdBackdrop) => tune({ backdrop })

  function move(tour: IAdTour, step: -1 | 1) {
    if (!selection.value) return

    const order = selection.value.tours.map(item => item.offer_id)
    const from = order.indexOf(tour.offer_id)
    const to = from + step

    if (to < 0 || to >= order.length) return

    const [moved] = order.splice(from, 1)

    if (moved) order.splice(to, 0, moved)

    void run('order', () => repository.patch(selection.value!.id, { order }))
  }

  function remove(tour: IAdTour) {
    if (!selection.value) return

    if (selection.value.tours.length < 2) {
      fail(t('cms.marketing.lastTour'))
      return
    }

    void run('order', () => repository.patch(selection.value!.id, {
      order: selection.value!.tours.filter(item => item.offer_id !== tour.offer_id).map(item => item.offer_id),
    }))
  }

  const recheck = () => selection.value && run('recheck', () => repository.recheck(selection.value!.id))

  async function write() {
    if (!selection.value) return

    const done = await run('write', () => repository.write(selection.value!.id, [...AD_LANGUAGES]), t('cms.marketing.aiDone'))

    if (done) {
      generation.value++
      syncDrafts(selection.value)
    }
  }

  async function pick(index: number) {
    if (!selection.value) return

    const done = await run('order', () => repository.patch(selection.value!.id, { pick: index }))

    if (done) syncDrafts(selection.value)
  }

  async function paint() {
    if (!selection.value) return

    busy.value = 'paint'

    try {
      set(await repository.paint(selection.value.id))
      imageBlocked.value = ''
      Object.assign(design, selection.value.design)
    }
    catch (error) {
      const message = readFailure(error, (key, params) => t(key, params ?? {}))

      if (message === t('cms.marketing.errors.billing')) imageBlocked.value = message

      failed(error)
    }
    finally {
      busy.value = ''
    }
  }

  async function useBackground(url: string | null) {
    if (!selection.value) return

    if (await run('background', () => repository.background(selection.value!.id, url))) Object.assign(design, selection.value!.design)
  }

  async function pickBackground() {
    if (!selection.value) return

    const picked = await modal.open<IGalleryResult>(Modal.Gallery, {
      library: mediaLibrary,
      accept: IMAGE_TYPES,
      current: selection.value.background?.url ?? null,
    })

    if (picked?.url) await useBackground(picked.url)
  }

  const archive = () => selection.value && run('archive', () => repository.archive(selection.value!.id))

  const restore = () => selection.value && run('archive', () => repository.restore(selection.value!.id))

  const link = computed(() => selection.value ? absolute(`/${language.value}/p/${selection.value.code}`) : '')

  const viewed = computed<ISelection | null>(() => {
    if (!selection.value) return null

    return {
      ...selection.value,
      design: { ...design },
      copy: {
        ...selection.value.copy,
        [language.value]: { ...draft[language.value], hashtags: tagsOf(hashtags[language.value]) },
      },
    }
  })

  const text = computed(() => viewed.value && ready.value ? adText(viewed.value, language.value, translate, link.value, SITE, undefined, toUzs) : null)

  const labels = computed<IBannerLabels>(() => ({
    departures: translate('marketing.banner.departures'),
    date: translate('marketing.banner.date'),
    hotel: translate('marketing.banner.hotel'),
    nights: translate('marketing.banner.nights'),
    price: translate('marketing.banner.price'),
    from: translate('marketing.banner.from'),
    perTour: translate('marketing.banner.perTour'),
  }))

  const specFor = (target: AdFormat, style?: AdStyle, template?: IAdTemplate | null): IBannerSpec | null => {
    if (!text.value || !fonts.value) return null

    const chosen = style ?? (selection.value?.style ?? 'classic') as AdStyle

    return {
      format: target,
      style: chosen,
      text: text.value,
      labels: labels.value,
      image: image.value,
      template: chosen === 'custom' ? template ?? selection.value?.template ?? null : null,
    }
  }

  const spec = computed(() => specFor(format.value))

  const motionSpec = computed<IMotionSpec | null>(() => text.value && fonts.value
    ? {
        format: format.value,
        text: text.value,
        image: image.value,
        template: selection.value?.style === 'custom' ? selection.value.template : null,
      }
    : null)

  const place = computed(() => text.value?.place ?? '')

  const sceneKind = computed(() => text.value?.scene ?? 'coast')

  const matches = ref<IMediaFile[]>([])

  watch(place, async (next) => {
    if (!next) return

    const found = await mediaLibrary(next).catch(() => [] as IMediaFile[])

    matches.value = found.filter(file => /\.(png|jpe?g|webp)$/i.test(file.path)).slice(0, 8)
  }, { immediate: true })

  const libraryPhotos = computed(() => matches.value.filter(file => !(selection.value?.backgrounds ?? []).some(item => item.url === file.url)))

  const thumbs = computed(() => AD_STYLES.map(style => ({ style, spec: specFor('post', style) })))

  const drafts = computed(() => (selection.value?.template_drafts ?? []).map(template => ({ template, spec: specFor('post', 'custom', template) })))

  const savedStyles = computed(() => savedData.value.map(item => ({ ...item, thumb: specFor('post', 'custom', item.spec) })))

  const isApplied = (template: IAdTemplate) => selection.value?.style === 'custom' && sameTemplate(selection.value.template, template)

  const isSaved = (template: IAdTemplate) => savedData.value.some(item => sameTemplate(item.spec, template))

  function applyTemplate(template: IAdTemplate) {
    if (!selection.value) return

    set({ ...selection.value, style: 'custom', template })
    void repository.patch(selection.value.id, { template }).then(set).catch(failed)
  }

  async function designTemplates() {
    if (!selection.value) return

    const done = await run('templates', () => repository.designTemplates(selection.value!.id), t('cms.marketing.templates.ready'))

    if (done) templateGeneration.value++
  }

  async function keepTemplate(template: IAdTemplate) {
    try {
      savedData.value = await repository.saveTemplate(template)
      saved(t('cms.marketing.templates.saved'))
    }
    catch (error) {
      failed(error)
    }
  }

  async function dropTemplate(item: ISavedTemplate) {
    try {
      savedData.value = await repository.archiveTemplate(item.id)
    }
    catch (error) {
      failed(error)
    }
  }

  const templateSteps = computed(() => [
    t('cms.marketing.steps.templates.read'),
    t('cms.marketing.steps.templates.compose'),
    t('cms.marketing.steps.templates.check'),
  ])

  const contacts = computed<IAdContact[]>(() => {
    const known = settings.value?.contacts ?? []

    return (selection.value?.contacts ?? []).map(contactId => known.find(contact => contact.id === contactId)).filter((contact): contact is IAdContact => Boolean(contact))
  })

  const withLink = computed(() => design.buttons === 'both' || design.buttons === 'link')
  const withManagers = computed(() => design.buttons === 'both' || design.buttons === 'managers')

  const managersLabel = computed(() => translate('marketing.post.managers'))

  const post = computed(() => text.value
    ? telegramPost(text.value, { link: true, contacts: withManagers.value ? contacts.value : [], managersLabel: managersLabel.value, footer: settings.value?.footer[language.value] ?? '' })
    : '')

  const caption = computed(() => text.value
    ? telegramPost(text.value, { link: !withLink.value, contacts: [], managersLabel: '', footer: settings.value?.footer[language.value] ?? '' })
    : '')

  const buttons = computed(() => [
    ...(withLink.value ? [{ text: draft[language.value].cta || 'TripMe' }] : []),
    ...(withManagers.value ? contacts.value.map(contact => ({ text: contact.name })) : []),
  ])

  let previewTimer: ReturnType<typeof setTimeout> | null = null

  watch([() => specFor('post'), panel], ([next, current]) => {
    if (previewTimer) clearTimeout(previewTimer)
    if (current !== 'post' || !next) return

    previewTimer = setTimeout(() => { telegramImage.value = toDataUrl(next) }, 250)
  }, { immediate: true })

  function toggleContact(contact: IAdContact) {
    if (!selection.value) return

    const current = selection.value.contacts
    const next = current.includes(contact.id)
      ? current.filter(item => item !== contact.id)
      : [...current, contact.id].slice(0, MAX_BUTTONS)

    set({ ...selection.value, contacts: next })
    void repository.patch(selection.value.id, { contacts: next }).then(set).catch(failed)
  }

  const setButtons = (value: AdButtons) => tune({ buttons: value })

  const filename = (target: AdFormat) => `tripme-${selection.value?.code ?? 'ad'}-${target}-${language.value}.png`

  async function downloadOne(target: AdFormat = format.value) {
    const wanted = specFor(target)

    if (!wanted) return false

    const done = await download(wanted, filename(target))

    if (!done) fail(t('cms.marketing.exportBlocked'))

    return done
  }

  async function downloadAll() {
    busy.value = 'download'

    try {
      for (const target of AD_FORMATS) {
        if (!await downloadOne(target)) return

        await new Promise(resolve => setTimeout(resolve, 350))
      }
    }
    finally {
      busy.value = ''
    }
  }

  async function publish() {
    const target = specFor('post')

    if (!selection.value || !target) return

    const blob = await toBlob(target)

    if (!blob) {
      fail(t('cms.marketing.exportBlocked'))
      return
    }

    await run('publish', () => repository.publish(selection.value!.id, {
      media: blob,
      kind: 'photo',
      caption: caption.value,
      language: language.value,
      link: link.value,
      cta: draft[language.value].cta,
    }), t('cms.marketing.published'))
  }

  let rendered: { spec: IMotionSpec, mood: AdMood, file: IVideoFile } | null = null

  async function renderClip(): Promise<IVideoFile | null> {
    const target = motionSpec.value

    if (!target) return null
    if (rendered && rendered.spec === target && rendered.mood === design.mood) return rendered.file

    busy.value = 'video'
    videoProgress.value = 0

    try {
      const { renderVideo, VideoUnsupportedError } = await import('~/modules/marketing/helpers/video/export')

      try {
        const file = await renderVideo(target, design.mood, (share) => { videoProgress.value = share })

        rendered = { spec: target, mood: design.mood, file }

        return file
      }
      catch (error) {
        if (error instanceof VideoUnsupportedError) {
          videoReady.value = false
          fail(t('cms.marketing.video.unsupported'))
        }
        else if (error instanceof DOMException && error.name === 'SecurityError') {
          fail(t('cms.marketing.exportBlocked'))
        }
        else {
          failed(error)
        }

        return null
      }
    }
    finally {
      busy.value = ''
    }
  }

  async function downloadVideo() {
    const file = await renderClip()

    if (file) saveBlob(file.blob, `tripme-${selection.value?.code ?? 'ad'}-${format.value}-${language.value}.mp4`)
  }

  async function publishVideo() {
    if (!selection.value) return

    const file = await renderClip()

    if (!file) return

    if (file.blob.size > MAX_VIDEO_BYTES) {
      fail(t('cms.marketing.video.tooLarge'))
      return
    }

    await run('publish', () => repository.publish(selection.value!.id, {
      media: file.blob,
      kind: 'video',
      caption: caption.value,
      language: language.value,
      link: link.value,
      cta: draft[language.value].cta,
      width: file.width,
      height: file.height,
      duration: file.duration,
    }), t('cms.marketing.video.published'))
  }

  const setMood = (mood: AdMood) => tune({ mood })

  const LINE_ADULTS = 2

  const editing = ref<string | null>(null)
  const lineError = ref('')
  const lineForm = reactive({ name: '', tier: false, stars: '', meal: '', district: '', date: '', nights: '', price: '', currency: 'USD' })

  const editable = (tour: IAdTour) => tour.source === 'own' || tour.source === 'post'

  function editLine(tour: IAdTour) {
    const people = Math.max(1, tour.adults + tour.children)

    editing.value = tour.offer_id
    lineError.value = ''
    Object.assign(lineForm, {
      name: tour.tier ? '' : tour.hotel_name,
      tier: Boolean(tour.tier),
      stars: tour.hotel_stars ? String(tour.hotel_stars) : '',
      meal: String(tour.meal_plan ?? ''),
      district: String(tour.district ?? ''),
      date: tour.check_in,
      nights: String(tour.nights || ''),
      price: String(Math.round(tour.price_amount / people)),
      currency: tour.price_currency,
    })
  }

  function addLine() {
    const first = selection.value?.tours[0]

    editing.value = 'new'
    lineError.value = ''
    Object.assign(lineForm, { name: '', tier: false, stars: '', meal: '', district: String(first?.district ?? ''), date: first?.check_in ?? '', nights: String(first?.nights || 7), price: '', currency: first?.price_currency ?? 'USD' })
  }

  async function saveLine() {
    if (!selection.value || !editing.value) return

    const stars = Number(lineForm.stars)
    const nights = Number(lineForm.nights)
    const price = Number(String(lineForm.price).replace(/\s/g, ''))

    if ((lineForm.tier ? !(stars >= 1 && stars <= 5) : !lineForm.name.trim()) || !/^\d{4}-\d{2}-\d{2}$/.test(lineForm.date) || !(nights > 0) || !(price > 0)) {
      lineError.value = t('cms.marketing.own.invalid')
      return
    }

    const first = selection.value.tours[0]
    const line: Partial<IAdTour> = {
      hotel_name: lineForm.tier ? `${stars}*` : lineForm.name.trim(),
      tier: lineForm.tier,
      hotel_stars: stars >= 1 && stars <= 5 ? stars : undefined,
      meal_plan: lineForm.meal || undefined,
      district: lineForm.district.trim() || undefined,
      check_in: lineForm.date,
      nights,
      adults: LINE_ADULTS,
      children: 0,
      price_amount: price * LINE_ADULTS,
      price_currency: lineForm.currency,
      route_from: first?.route_from,
      route_to: first?.route_to,
      route_to_label: first?.route_to_label,
      countries: first?.countries,
    }
    const tours: Array<Partial<IAdTour>> = editing.value === 'new'
      ? [...selection.value.tours, { ...line, offer_id: '' }]
      : selection.value.tours.map(tour => (tour.offer_id === editing.value ? { ...tour, ...line } : tour))

    if (await run('order', () => repository.patch(selection.value!.id, { tours }))) editing.value = null
  }

  function toggleInclude(key: AdInclude) {
    if (!selection.value) return

    const current = selection.value.includes ?? []
    const includes = current.includes(key) ? current.filter(item => item !== key) : AD_INCLUDES.filter(item => item === key || current.includes(item))

    set({ ...selection.value, includes })
    void repository.patch(selection.value.id, { includes }).then(set).catch(failed)
  }

  const moodItems = computed(() => AD_MOODS.map(value => ({
    value,
    title: t(`cms.marketing.video.moods.${value}.title`),
    sub: t(`cms.marketing.video.moods.${value}.sub`),
  })))

  const videoFacts = computed(() => {
    const { width, height } = AD_SIZES[format.value]

    return t('cms.marketing.video.facts', { seconds: DURATION, size: `${width}×${height}` })
  })

  watch(panel, async (next) => {
    if (next !== 'video' || !import.meta.client) return

    const { canRenderVideo } = await import('~/modules/marketing/helpers/video/export')

    videoReady.value = await canRenderVideo(format.value)
  })

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      saved(t('cms.marketing.copied'))
    }
    catch {
      fail(t('quote.copyFailed'))
    }
  }

  const openSettings = (tab: 'voice' | 'visual' | 'managers') => {
    settingsTab.value = tab
    settingsOpen.value = true
  }

  const hotelOf = (tour: IAdTour) => (tour.tier ? t('marketing.banner.tier', { stars: Number(tour.hotel_stars) || '' }) : tourFromTrip(tour, tour.offer_id).displayName())

  const priceOf = (tour: IAdTour, amount = tour.price_amount) =>
    amountOf(design.price === 'person' ? amount / Math.max(1, tour.adults + tour.children) : amount, tour.price_currency, language.value, translate)

  const panelItems = computed(() => [
    { value: 'image', label: t('cms.marketing.panels.image') },
    { value: 'post', label: t('cms.marketing.panels.post') },
    { value: 'video', label: t('cms.marketing.panels.video') },
    { value: 'page', label: t('cms.marketing.panels.page') },
    { value: 'tours', label: t('cms.marketing.panels.tours'), count: selection.value?.tours.length },
  ])

  const formatItems = computed(() => AD_FORMATS.map(value => ({ value, label: t(`cms.marketing.formats.${value}`) })))

  const languageItems = AD_LANGUAGES.map(value => ({ value, label: value.toUpperCase() }))

  const buttonItems = computed(() => (['both', 'managers', 'link', 'none'] as AdButtons[]).map(value => ({ value, label: t(`cms.marketing.buttons.${value}`) })))

  const hotelOptions = computed(() => [
    { value: '', label: t('cms.marketing.mode.list', { n: selection.value?.tours.length ?? 0 }) },
    ...(selection.value?.tours ?? []).map(tour => ({ value: tour.offer_id, label: `${hotelOf(tour)} — ${priceOf(tour)}` })),
  ])

  const moreItems = computed(() => selection.value?.archived_at
    ? []
    : [
        { key: 'voice', label: t('cms.marketing.settings.voice'), icon: 'pencil' },
        { key: 'visual', label: t('cms.marketing.settings.visual'), icon: 'image' },
        { key: 'managers', label: t('cms.marketing.settings.managers'), icon: 'users' },
        { key: 'archive', label: t('cms.marketing.archive'), icon: 'folder' },
      ])

  const onMore = (key: string) => {
    if (key === 'archive') void archive()
    if (key === 'voice' || key === 'visual' || key === 'managers') openSettings(key)
  }

  const variants = computed(() => selection.value?.variants?.[language.value] ?? [])

  const writeSteps = computed(() => [
    t('cms.marketing.steps.write.read'),
    t('cms.marketing.steps.write.voice'),
    t('cms.marketing.steps.write.check'),
  ])

  const paintSteps = computed(() => [
    t('cms.marketing.steps.paint.scene', { place: selection.value?.title ?? '' }),
    t('cms.marketing.steps.paint.draw'),
    t('cms.marketing.steps.paint.place'),
  ])

  const backTo = computed(() => localePath('/app/marketing'))

  onBeforeUnmount(() => {
    if (previewTimer) clearTimeout(previewTimer)
    if (designTimer) clearTimeout(designTimer)

    if (copyTimer) {
      clearTimeout(copyTimer)
      void saveCopy(language.value)
    }
  })

  return {
    selection, settings, status, panel, format, language, busy, generation, imageBlocked, title, design, draft, hashtags,
    spec, motionSpec, thumbs, drafts, savedStyles, templateGeneration, templateSteps, post, buttons, contacts, link, telegramImage, variants, settingsOpen, settingsTab,
    videoProgress, videoReady, videoFacts, moodItems, setMood, downloadVideo, publishVideo,
    editing, lineForm, lineError, editable, editLine, addLine, saveLine, toggleInclude, includeKeys: AD_INCLUDES,
    panelItems, formatItems, languageItems, buttonItems, hotelOptions, moreItems, writeSteps, paintSteps, backTo,
    contextBackdrops: CONTEXT_BACKDROPS, place, sceneKind, libraryPhotos, withManagers,
    edited, tune, saveTitle, setStyle, setBackdrop, move, remove, recheck, write, pick, paint, useBackground, pickBackground,
    applyTemplate, designTemplates, keepTemplate, dropTemplate, isApplied, isSaved,
    restore, onMore, toggleContact, setButtons, downloadOne, downloadAll, publish, copy, openSettings, setSettings, hotelOf, priceOf,
  }
}
