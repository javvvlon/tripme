import type { ITripmeAnswer } from '../contracts/ai'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAiRepository = () => {
  const http = useHttp()

  const ask = async (
    text: string,
    image: Blob | null,
    history: Array<{ role: string, text: string }>,
    context: Record<string, unknown>,
  ): Promise<ITripmeAnswer> => {
    const form = new FormData()

    form.append('text', text)
    form.append('history', JSON.stringify(history))
    form.append('context', JSON.stringify(context))

    if (image) form.append('image', image, 'post.png')

    return (await http.call<ITripmeAnswer>('Ai', 'ask', {}, form)).data
  }

  return { ask }
}
