import { Banner } from '~/modules/content/models/Banner'
import { HomeContent } from '~/modules/content/models/HomeContent'
import { BannerIntention } from '~/modules/content/intentions/banner'
import type { IBannerRaw, BannerDraft, ContentLocale } from '~/modules/content/contracts/content'
import type {
  IContentLayoutRaw,
  IContentListRaw,
  IEditableSectionRaw,
  IHomeContentRaw,
  IListSummaryRaw,
  IStoredFileRaw,
} from '~/modules/content/contracts/blocks'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useContentRepository = () => {
  const http = useHttp()

  const banner = async (): Promise<Banner> => {
    const response = await http.call<IBannerRaw>('Content', 'banner')

    return Banner.fromRaw(response.data)
  }

  const saveBanner = async (draft: BannerDraft): Promise<Banner> => {
    const body = new BannerIntention().toRequest(draft)
    const response = await http.call<IBannerRaw>('Content', 'saveBanner', {}, body as AnyObject)

    return Banner.fromRaw(response.data)
  }

  const homeContent = async (locale: ContentLocale): Promise<HomeContent> => {
    const response = await http.call<IHomeContentRaw>('Content', 'homeContent')

    return HomeContent.forLocale(response.data, locale)
  }

  const layouts = async (): Promise<IContentLayoutRaw[]> => {
    const response = await http.call<{ items: IContentLayoutRaw[] }>('Content', 'layouts')

    return response.data.items
  }

  const lists = async (): Promise<IListSummaryRaw[]> => {
    const response = await http.call<{ items: IListSummaryRaw[] }>('Content', 'lists')

    return response.data.items
  }

  const list = async (id: string): Promise<IContentListRaw> => {
    const response = await http.call<IContentListRaw>('Content', 'list', { id })

    return response.data
  }

  const createList = async (payload: AnyObject): Promise<{ uuid: string }> => {
    const response = await http.call<{ uuid: string }>('Content', 'createList', {}, payload)

    return response.data
  }

  const updateList = async (id: string, payload: AnyObject): Promise<void> => {
    await http.call<void>('Content', 'updateList', { id }, payload)
  }

  const deleteList = async (id: string): Promise<void> => {
    await http.call<void>('Content', 'deleteList', { id })
  }

  const sections = async (): Promise<IEditableSectionRaw[]> => {
    const response = await http.call<{ items: IEditableSectionRaw[] }>('Content', 'sections')

    return response.data.items
  }

  const upload = async (file: File): Promise<string> => {
    const body = new FormData()
    body.append('file', file, file.name)

    const response = await http.call<{ url: string }>('Content', 'upload', {}, body)

    return response.data.url
  }

  /**
   * Tidying up, so a failure here must not surface as a failed edit: the
   * editor's change is already saved, and an extra file in a bucket is a
   * smaller problem than an error they cannot act on.
   */
  const library = async (query = ''): Promise<IStoredFileRaw[]> => {
    const response = await http.call<IStoredFileRaw[]>('Content', 'library', query ? { q: query } : {})

    return response.data
  }

  const removeUpload = async (url: string): Promise<void> => {
    try {
      await http.call<void>('Content', 'removeUpload', { url })
    }
    catch {
      // deliberately swallowed — see above
    }
  }

  /**
   * Names a stored file. Unlike removal this is not tidying up, so a failure
   * is surfaced: the editor asked for the name to change.
   */
  const renameUpload = async (url: string, title: string): Promise<void> => {
    await http.call<void>('Content', 'renameUpload', {}, { url, title })
  }

  const saveSections = async (items: AnyObject[]): Promise<void> => {
    await http.call<void>('Content', 'saveSections', {}, { items })
  }

  return {
    banner, saveBanner, homeContent,
    layouts, lists, list, createList, updateList, deleteList, sections, saveSections, upload, library, removeUpload, renameUpload,
  }
}
