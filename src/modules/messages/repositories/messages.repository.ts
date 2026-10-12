import type { AnyObject } from '~/shared/contracts/data'
import type { IInboxRow, IMessage, IQuoteVariantInput, IThread, VariantDecision } from '../contracts/messages'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMessagesRepository = () => {
  const http = useHttp()

  const mine = async (): Promise<IThread> => (await http.call<IThread>('Messages', 'mine')).data

  const mineUnread = async (): Promise<number> => (await http.call<{ unread: number }>('Messages', 'mineUnread')).data.unread

  const sendMine = async (body: string): Promise<IMessage> =>
    (await http.call<IMessage>('Messages', 'sendMine', {}, { body } as AnyObject)).data

  const inbox = async (): Promise<IInboxRow[]> => (await http.call<IInboxRow[]>('Messages', 'inbox')).data

  const inboxUnread = async (): Promise<number> => (await http.call<{ unread: number }>('Messages', 'inboxUnread')).data.unread

  const clientThread = async (id: string): Promise<IThread> => (await http.call<IThread>('Messages', 'clientThread', { id })).data

  const sendToClient = async (id: string, body: string): Promise<IMessage> =>
    (await http.call<IMessage>('Messages', 'sendToClient', { id }, { body } as AnyObject)).data

  const sendQuote = async (id: string, quote: { body: string, lead_id: string, locale: string, variants: IQuoteVariantInput[] }): Promise<IMessage> =>
    (await http.call<IMessage>('Messages', 'sendQuote', { id }, quote as unknown as AnyObject)).data

  const answerVariant = async (id: string, n: number, decision: VariantDecision): Promise<IMessage> =>
    (await http.call<IMessage>('Messages', 'answerVariant', { id, n }, { decision } as AnyObject)).data

  const clientUnread = async (id: string): Promise<number> =>
    (await http.call<{ unread: number }>('Messages', 'clientUnread', { id })).data.unread

  const streamTicket = async (): Promise<string> => (await http.call<{ ticket: string }>('Messages', 'streamTicket')).data.ticket

  return { mine, mineUnread, sendMine, inbox, inboxUnread, clientThread, sendToClient, sendQuote, answerVariant, clientUnread, streamTicket }
}
