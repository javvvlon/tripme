import type { IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'
import { useContentRepository } from '~/modules/content/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useMediaLibrary = () => {
  const { library } = useContentRepository()

  const mediaLibrary = async (): Promise<IMediaFile[]> =>
    (await library()).map(item => ({ url: item.url, path: item.path }))

  return { mediaLibrary }
}
