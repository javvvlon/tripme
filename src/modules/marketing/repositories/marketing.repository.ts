import type { AnyObject } from '~/shared/contracts/data'
import type { IPageRaw } from '~/shared/contracts/pagination'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'
import type { AdLanguage, IAdContact, IAdTemplate, IAssistantAnswer, IBotLink, IBotStatus, IMarketingSettings, IPublicSelection, IPublishDraft, ISavedTemplate, ISelection, ISelectionPatch, ISelectionRow } from '../contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMarketingRepository = () => {
  const http = useHttp()

  const shared = async (code: string): Promise<IPublicSelection> =>
    (await http.call<IPublicSelection>('Marketing', 'shared', { code })).data

  const list = async (query: { page: number, per_page: number, q?: string, archived?: string }): Promise<IPageRaw<ISelectionRow>> =>
    (await http.call<IPageRaw<ISelectionRow>>('Marketing', 'list', query as AnyObject)).data

  const create = async (tours: ILeadTrip[]): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'create', {}, { tours } as AnyObject)).data

  const one = async (id: string): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'one', { id })).data

  const patch = async (id: string, changes: ISelectionPatch): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'patch', { id }, changes as AnyObject)).data

  const recheck = async (id: string): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'recheck', { id }, {})).data

  const write = async (id: string, languages: AdLanguage[]): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'write', { id }, { languages } as AnyObject)).data

  const paint = async (id: string): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'paint', { id }, {})).data

  const background = async (id: string, url: string | null): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'background', { id }, { url: url ?? '' } as AnyObject)).data

  const archive = async (id: string): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'archive', { id }, {})).data

  const restore = async (id: string): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'restore', { id }, {})).data

  const publish = async (id: string, draft: IPublishDraft): Promise<ISelection> => {
    const form = new FormData()

    if (draft.kind === 'video') form.append('video', draft.media, 'tripme.mp4')
    else form.append('image', draft.media, 'tripme.png')

    form.append('caption', draft.caption)
    form.append('language', draft.language)
    form.append('link', draft.link)
    form.append('cta', draft.cta)

    for (const key of ['width', 'height', 'duration'] as const) {
      if (draft[key]) form.append(key, String(draft[key]))
    }

    return (await http.call<ISelection>('Marketing', 'publish', { id }, form)).data
  }

  const settings = async (): Promise<IMarketingSettings> =>
    (await http.call<IMarketingSettings>('Marketing', 'settings')).data

  const designTemplates = async (id: string): Promise<ISelection> =>
    (await http.call<ISelection>('Marketing', 'designTemplates', { id }, {})).data

  const templates = async (): Promise<ISavedTemplate[]> =>
    (await http.call<ISavedTemplate[]>('Marketing', 'templates')).data

  const saveTemplate = async (spec: IAdTemplate, name?: string): Promise<ISavedTemplate[]> =>
    (await http.call<ISavedTemplate[]>('Marketing', 'saveTemplate', {}, { spec, name } as AnyObject)).data

  const archiveTemplate = async (id: string): Promise<ISavedTemplate[]> =>
    (await http.call<ISavedTemplate[]>('Marketing', 'archiveTemplate', { id }, {})).data

  const saveSettings = async (changes: { voice?: string, contacts?: IAdContact[], footer?: Record<AdLanguage, string>, visual?: string }): Promise<IMarketingSettings> =>
    (await http.call<IMarketingSettings>('Marketing', 'saveSettings', {}, changes as AnyObject)).data

  const assistant = async (text: string, image: Blob | null, history: Array<{ role: string, text: string }>): Promise<IAssistantAnswer> => {
    const form = new FormData()

    form.append('text', text)
    form.append('history', JSON.stringify(history))

    if (image) form.append('image', image, 'post.png')

    return (await http.call<IAssistantAnswer>('Marketing', 'assistant', {}, form)).data
  }

  const bot = async (): Promise<IBotStatus> =>
    (await http.call<IBotStatus>('Marketing', 'bot')).data

  const botLink = async (): Promise<IBotLink> =>
    (await http.call<IBotLink>('Marketing', 'botLink', {}, {})).data

  const botUnlink = async (): Promise<IBotStatus> =>
    (await http.call<IBotStatus>('Marketing', 'botUnlink', {}, {})).data

  return { shared, list, create, one, patch, recheck, write, paint, background, archive, restore, publish, settings, saveSettings, designTemplates, templates, saveTemplate, archiveTemplate, assistant, bot, botLink, botUnlink }
}
