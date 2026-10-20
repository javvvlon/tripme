import type { IAssistantAnswer } from '~/modules/marketing/contracts/marketing'
import type { IBlogAssistantAnswer } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type AiDomain = 'marketing' | 'blog' | 'general'

export type ITripmeAnswer =
  | { domain: 'marketing', text: string, marketing: IAssistantAnswer }
  | { domain: 'blog', blog: IBlogAssistantAnswer }
  | { domain: 'general', reply: string, suggestions: string[] }
