import type { IAssistantAnswer } from '~/modules/marketing/contracts/marketing'
import type { IBlogAssistantAnswer } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type AiDomain = 'marketing' | 'blog' | 'image' | 'general'

export interface IGeneratedImage {
  url: string
  width: number
  height: number
  ratio: string
  format: 'jpeg' | 'png' | 'webp'
  title: string
}

export interface IImageAnswer {
  reply: string
  prompt: string
  images: IGeneratedImage[]
  failed: number
  suggestions: string[]
}

export type ITripmeAnswer =
  | { domain: 'marketing', text: string, marketing: IAssistantAnswer }
  | { domain: 'blog', blog: IBlogAssistantAnswer }
  | { domain: 'image', image: IImageAnswer }
  | { domain: 'general', reply: string, suggestions: string[] }
