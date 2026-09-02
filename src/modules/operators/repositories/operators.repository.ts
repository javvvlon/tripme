import type { IOperatorDraft, IOperatorRaw } from '../contracts/operators'
import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useOperatorsRepository = () => {
  const http = useHttp()

  const all = async (): Promise<IOperatorRaw[]> => {
    const response = await http.call<{ items: IOperatorRaw[] }>('Operators', 'all')

    return response.data.items
  }

  const toggle = async (id: string, enabled: boolean): Promise<IOperatorRaw> => {
    const response = await http.call<IOperatorRaw>('Operators', 'patch', { id }, { is_enabled: enabled })

    return response.data
  }

  /**
   * Secrets left blank are not sent: the form never receives the stored value,
   * so an untouched field must not be read as an instruction to clear it.
   */
  const save = async (id: string, draft: IOperatorDraft): Promise<IOperatorRaw> => {
    const body: AnyObject = {
      name: draft.name.trim(),
      connection: draft.connection,
      site_url: draft.siteUrl.trim(),
      api_base_url: draft.apiBaseUrl.trim(),
      api_login: draft.apiLogin.trim(),
      note: draft.note.trim(),
    }

    if (draft.apiKey.trim()) body.api_key = draft.apiKey.trim()
    if (draft.apiSecret.trim()) body.api_secret = draft.apiSecret.trim()

    const response = await http.call<IOperatorRaw>('Operators', 'patch', { id }, body)

    return response.data
  }

  return { all, toggle, save }
}
